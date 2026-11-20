from pathlib import Path
import json
import numpy as np
import pandas as pd
from scipy import stats
import statsmodels.formula.api as smf
from statsmodels.stats.anova import anova_lm
from statsmodels.stats.multicomp import pairwise_tukeyhsd
from statsmodels.stats.diagnostic import het_breuschpagan

def load_data(path):
    return pd.read_csv(path, sep=None, engine="python")

def validate_data(data, response, treatment, block=None):
    cols=[response,treatment]+([block] if block else [])
    missing=set(cols)-set(data.columns)
    if missing: raise ValueError(f"Colunas ausentes: {sorted(missing)}")
    if not pd.api.types.is_numeric_dtype(data[response]): raise TypeError("Resposta deve ser numérica.")
    if data[cols].isna().any().any(): raise ValueError("Há valores ausentes nas colunas do modelo.")
    if data[treatment].nunique()<2: raise ValueError("São necessários dois ou mais tratamentos.")
    if block and data[block].nunique()<2: raise ValueError("DBC requer dois ou mais blocos.")

def analyze(data,response,treatment,block=None):
    validate_data(data,response,treatment,block)
    formula=f"{response} ~ C({treatment})"+(f" + C({block})" if block else "")
    model=smf.ols(formula,data=data).fit()
    table=anova_lm(model,typ=2)
    desc=data.groupby(treatment,observed=True)[response].agg(n="count",mean="mean",std="std",median="median",min="min",max="max").reset_index()
    e=model.resid
    sw=stats.shapiro(e) if 3<=len(e)<=5000 else None
    bp=het_breuschpagan(e,model.model.exog) if len(e)>model.model.exog.shape[1]+1 else None
    diag={"r_squared":float(model.rsquared),"adjusted_r_squared":float(model.rsquared_adj),
          "shapiro_p":float(sw.pvalue) if sw else None,
          "breusch_pagan_p":float(bp[1]) if bp else None,
          "residual_mean":float(np.mean(e)),"residual_sd":float(np.std(e,ddof=1))}
    return {"design":"DBC" if block else "DIC","model":model,"anova":table,"descriptive":desc,"diagnostics":diag}

def tukey_comparison(data,response,treatment,alpha=.05):
    validate_data(data,response,treatment)
    return pairwise_tukeyhsd(data[response],data[treatment],alpha=alpha)

def kruskal_test(data,response,treatment):
    validate_data(data,response,treatment)
    return stats.kruskal(*[g[response].to_numpy() for _,g in data.groupby(treatment,observed=True)])

def export_result(result,output):
    out=Path(output);out.mkdir(parents=True,exist_ok=True)
    result["anova"].to_csv(out/"anova.csv")
    result["descriptive"].to_csv(out/"descriptive.csv",index=False)
    (out/"diagnostics.json").write_text(json.dumps(result["diagnostics"],indent=2),encoding="utf-8")
    pd.DataFrame({"fitted":result["model"].fittedvalues,"residual":result["model"].resid}).to_csv(out/"residuals.csv",index=False)
