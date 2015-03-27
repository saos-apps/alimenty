library(jsonlite)
library(saos)

# alimony
l <- fromJSON("alimony.json")
# dociągnięcie pozostałych danych
l2 <- get_judgments(l$judgmentId)
saveRDS(l2, file="alimenty-full.rds")
l2 <- readRDS("alimenty-full.rds")

x <- with(l$value, table(result, defendantSex))
signif(prop.table(x, 2) * 100, 2)




