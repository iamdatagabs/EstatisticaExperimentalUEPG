if (!requireNamespace("testthat", quietly=TRUE)) stop("Instale testthat.")
source("R/R/experimental.R")
testthat::test_that("DIC ajusta ANOVA", {
 d <- data.frame(y=c(2,3,4,5,6,7),trat=rep(c("A","B"),each=3))
 f <- analyze_dic(d,"y","trat")
 testthat::expect_equal(f$design,"DIC")
 testthat::expect_true("trat" %in% rownames(f$anova))
})
testthat::test_that("DBC inclui blocos", {
 d <- data.frame(y=1:12,trat=rep(letters[1:3],4),bloco=rep(1:4,each=3))
 f <- analyze_dbc(d,"y","trat","bloco")
 testthat::expect_true(all(c("trat","bloco") %in% rownames(f$anova)))
})
