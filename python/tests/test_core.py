import pandas as pd
import pytest
from experimental_stats.core import analyze,validate_data
@pytest.fixture
def data():
 return pd.DataFrame({"y":[2,3,4,5,6,7,4,5,6,7,8,9],"trat":["A"]*3+["B"]*3+["A"]*3+["B"]*3,"bloco":[1]*6+[2]*6})
def test_dic(data):
 r=analyze(data,"y","trat");assert r["design"]=="DIC";assert "C(trat)" in r["anova"].index
def test_dbc(data):
 r=analyze(data,"y","trat","bloco");assert r["design"]=="DBC";assert "C(bloco)" in r["anova"].index
def test_missing_column(data):
 with pytest.raises(ValueError): validate_data(data,"y","grupo")
