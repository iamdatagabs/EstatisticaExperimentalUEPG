import argparse
from .core import load_data,analyze,tukey_comparison,export_result
def main():
 p=argparse.ArgumentParser(description="Análise de experimentos DIC/DBC")
 p.add_argument("csv");p.add_argument("--response",required=True);p.add_argument("--treatment",required=True);p.add_argument("--block");p.add_argument("--output",default="reports/python")
 a=p.parse_args();d=load_data(a.csv);r=analyze(d,a.response,a.treatment,a.block)
 print("Delineamento:",r["design"]);print(r["descriptive"].to_string(index=False));print(r["anova"]);print(r["diagnostics"]);print(tukey_comparison(d,a.response,a.treatment));export_result(r,a.output)
if __name__=="__main__": main()
