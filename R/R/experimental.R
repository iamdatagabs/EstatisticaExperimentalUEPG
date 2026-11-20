read_experiment <- function(path) {
  if (!file.exists(path)) stop("Arquivo não encontrado: ", path)
  utils::read.csv(path, stringsAsFactors = FALSE, check.names = FALSE)
}
validate_experiment <- function(data, response, treatment, block = NULL) {
  required <- c(response, treatment, block)
  required <- required[!is.na(required) & nzchar(required)]
  missing <- setdiff(required, names(data))
  if (length(missing)) stop("Colunas ausentes: ", paste(missing, collapse = ", "))
  if (!is.numeric(data[[response]])) stop("A variável resposta deve ser numérica.")
  if (anyNA(data[, required, drop = FALSE])) stop("Há valores ausentes nas colunas do modelo.")
  if (length(unique(data[[treatment]])) < 2) stop("São necessários ao menos dois tratamentos.")
  if (!is.null(block) && length(unique(data[[block]])) < 2) stop("DBC requer ao menos dois blocos.")
  invisible(TRUE)
}
fit_experiment <- function(data, response, treatment, block = NULL) {
  validate_experiment(data, response, treatment, block)
  data[[treatment]] <- factor(data[[treatment]])
  design <- "DIC"
  terms <- treatment
  if (!is.null(block)) {
    data[[block]] <- factor(data[[block]])
    terms <- c(treatment, block)
    design <- "DBC"
  }
  model <- stats::lm(stats::reformulate(terms, response), data = data)
  list(model=model, anova=stats::anova(model), design=design, data=data,
       response=response, treatment=treatment, block=block)
}
analyze_dic <- function(data, response, treatment) fit_experiment(data, response, treatment)
analyze_dbc <- function(data, response, treatment, block) fit_experiment(data, response, treatment, block)
diagnose_experiment <- function(result) {
  e <- stats::residuals(result$model)
  shapiro <- if (length(e) >= 3 && length(e) <= 5000) stats::shapiro.test(e) else NULL
  list(shapiro=shapiro, residuals=e, fitted=stats::fitted(result$model),
       note="Interprete testes junto aos gráficos; independência depende do delineamento.")
}
compare_treatments <- function(result, method="tukey", alpha=.05) {
  method <- match.arg(method, c("tukey","holm","bonferroni"))
  if (method == "tukey") return(stats::TukeyHSD(stats::aov(result$model), which=result$treatment, conf.level=1-alpha))
  stats::pairwise.t.test(result$data[[result$response]], result$data[[result$treatment]], p.adjust.method=method)
}
kruskal_experiment <- function(data, response, treatment) {
  validate_experiment(data, response, treatment)
  stats::kruskal.test(stats::reformulate(treatment, response), data=data)
}
export_experiment <- function(result, directory="reports/R") {
  dir.create(directory, recursive=TRUE, showWarnings=FALSE)
  utils::write.csv(as.data.frame(result$anova), file.path(directory,"anova.csv"))
  utils::write.csv(data.frame(fitted=fitted(result$model), residual=residuals(result$model)),
                   file.path(directory,"diagnostics.csv"), row.names=FALSE)
  invisible(directory)
}
