library(jsonlite)
library(saos)
library(plyr)
library(dplyr)
library(sqldf)


# alimony
l <- fromJSON("alimony.json")
o1 <- cbind( data.frame( judgmentId = l$judgmentId), l$value ) # spłaszczenie



# dociągnięcie pozostałych danych
if(FALSE) {
l2 <- get_judgments(l$judgmentId)
saveRDS(l2, file="alimenty-full.rds")
}
l2 <- readRDS("alimenty-full.rds")
o2 <- ldply(l2, function(x) expand.grid(id=x$id, judge=sapply(x$judges, "[[", "name")) )
o2$imie <- sapply(strsplit(o2$judge, " "), "[", 1)
o2$kobieta <- substr( o2$imie, start=nchar(o2$imie), stop=nchar(o2$imie) ) == "a"
o2$kobieta[ grepl("\\.", o2$imie) ] <- NA
o2u <- o2 %>% group_by(id) %>% summarise(pkobieta = mean(kobieta, na.rm=TRUE))

# Połączenie
alimenty <- sqldf("select o1.*, o2u.pkobieta from o1 left join o2u on o1.judgmentId=o2u.id")
vnames <- c("result", "defendantSex")
alimenty[vnames] <- lapply(alimenty[vnames], function(x) {
                             x[ x=="?" ] <- NA
                             x
} )

#============================================================================ 

table(alimenty$reason)
table(alimenty$result)
with(alimenty, table(reason, result))

alimenty$result[ alimenty$result == "zasądza" & alimenty$reason == "o obniżenie alimentów" ] <- "obniża"
alimenty$result[ alimenty$result == "zasądza" & alimenty$reason == "o podwyższenie alimentów" ] <- "podwyższa"
alimenty$result[ alimenty$result == "oddala" & alimenty$reason == "o obniżenie alimentów" ] <- "podwyższa"
alimenty$result[ alimenty$result == "oddala" & alimenty$reason == "o podwyższenie alimentów" ] <- "obniża"

x <- with(alimenty, table(result,
                          judge=ifelse(pkobieta >= 0.5, "k", "m"),
                          defendant = defendantSex ))
ftable( aperm(x, c(3,2,1)))
p <- prop.table(x, 2:3)
ftable( aperm(signif(p, 2), c(3,2,1)))

# mydling
d <- as.data.frame(x) %>% filter( !(result %in% c("uchyla", "zasądza", "oddala", "zmienia")) )
m0 <- glm( Freq ~ result + judge * defendant, data=d, family=poisson,
          subset=d$defendant != "both")
m1 <- update(m0, . ~ . + result*(judge + defendant))
m2 <- update(m1, . ~ . + result*judge*defendant)
anova(m0, m1, m2, test="Chisq")
AIC(m0, m1, m2)

#============================================================================ 

s <- alimenty %>% 
  mutate(judge = ifelse(pkobieta >= 0.5, "k", "m"),
         defendant = defendantSex,
         result = (result == "podwyższa") ) %>%
  filter(!(result %in% c("oddala", "uchyla", "zasądza", "zmienia"))) %>%
  filter( defendant != "both" )

m0 <- glm(result ~ judge + defendant, data=s, family=binomial("logit"))
m1 <- update(m0, . ~ . + judge * defendant )
AIC(m0, m1)


