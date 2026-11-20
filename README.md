# Estatística Experimental e Engenharia

Projeto didático e reprodutível de Estatística Experimental, análise de dados e engenharia científica em **R + Python**. Preserva os materiais históricos e acrescenta uma arquitetura modular, testes automatizados e dashboard público.

## Funcionalidades
- R: DIC, DBC, ANOVA, diagnóstico de resíduos, Tukey, testes não paramétricos e exportação.
- Python: validação de dados, estatística descritiva, ANOVA, Shapiro-Wilk, Breusch-Pagan, Tukey e exportação CSV/JSON.
- Dashboard web para exploração e upload de CSV.
- CI para executar testes R e Python e publicação via GitHub Pages.

> Os dados de exemplo são didáticos e não representam coleta experimental real.

## Estrutura
```
R/R/                  funções reutilizáveis
R/scripts/            execução de análises
R/tests/              testes R
python/src/           pacote Python
python/tests/         testes Python
data/raw/             dados originais e exemplos
reports/              resultados gerados
docs/                 dashboard GitHub Pages
legacy/               scripts históricos preservados
```

## Uso rápido

R (R >= 4.2):
```r
source("R/R/experimental.R")
d <- read_experiment("data/raw/dic_milho.csv")
fit <- analyze_dic(d, "y", "trat")
fit$anova
```
DBC: `analyze_dbc(dados, "y", "trat", "bloco")`.

Python (Python >= 3.10):
```bash
pip install -r python/requirements.txt
PYTHONPATH=python/src python -m experimental_stats.cli data/raw/dic_milho.csv --response y --treatment trat --output reports/python
```

Testes:
```bash
Rscript R/tests/testthat.R
pip install -r python/requirements-dev.txt
PYTHONPATH=python/src pytest python/tests -q
```

## Método
1. Validar variáveis, ausências, replicações e unidade experimental.
2. Explorar distribuição, variabilidade e possíveis valores atípicos.
3. Ajustar o modelo coerente com o delineamento.
4. Diagnosticar resíduos e interpretar os gráficos junto aos testes.
5. Aplicar comparações múltiplas ou alternativas não paramétricas quando justificadas.
6. Exportar resultados e documentar decisões.

Shapiro-Wilk e testes de variância não provam pressupostos. Independência depende do desenho experimental e da aleatorização. Em DBC, o bloco deve entrar no modelo.

## Materiais históricos
Os scripts originais foram preservados em `legacy/`. Alguns materiais antigos referenciam arquivos locais que não estavam no repositório (como `DBC1.csv` e `dados_aula8.csv`). O novo pipeline usa dados autocontidos.

## Aplicativo mobile (PWA)

[Abra o aplicativo Estatística Experimental](https://iamdatagabs.github.io/EstatisticaExperimentalUEPG/app/). O aplicativo pode ser instalado na tela inicial de dispositivos compatíveis e oferece interface responsiva, importação de CSV, carregamento das bases do repositório, pré-visualização dos dados, estatística descritiva por grupo, ANOVA de um fator, gráficos e exportação de resultados. O processamento ocorre localmente no navegador; após o primeiro carregamento, a interface fica disponível offline. A análise inferencial é exploratória e deve ser validada conforme o delineamento experimental. Para DBC, modelos fatoriais, diagnósticos e análises especializadas, utilize os módulos R/Python.

## Dashboard
[Abra o painel principal](https://iamdatagabs.github.io/EstatisticaExperimentalUEPG/) · [Abra o Laboratório de Dados](https://iamdatagabs.github.io/EstatisticaExperimentalUEPG/painel.html). O segundo painel oferece upload de CSV, filtros, indicadores, gráficos dinâmicos, estatísticas descritivas por grupo e exportação da seleção. Ambos são exploratórios; análises inferenciais completas devem ser executadas em R/Python.

Tecnologias: R, Python, pandas, NumPy, SciPy, statsmodels, pytest, testthat, HTML, CSS, JavaScript e GitHub Actions.
