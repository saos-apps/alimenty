library(jsonlite)
library(saos)
library(plyr)
library(dplyr)
library(sqldf)
library(tm.plugin.webmining)
library(tm)

#polish stopwords
polishStopWords <- c("a","aby","ach","acz","aczkolwiek","aj","albo","ale","ależ","ani","aż","bardziej","bardzo","bo","bowiem","by","byli","bynajmniej","być","był","była","było","były","będzie","będą","cali","cała","cały","ci","cię","ciebie","co","cokolwiek","coś","czasami","czasem","czemu","czy","czyli","daleko","dla","dlaczego","dlatego","do","dobrze","dokąd","dość","dużo","dwa","dwaj","dwie","dwoje","dziś","dzisiaj","gdy","gdyby","gdyż","gdzie","gdziekolwiek","gdzieś","i","ich","ile","im","inna","inne","inny","innych","iż","ja","ją","jak","jakaś","jakby","jaki","jakichś","jakie","jakiś","jakiż","jakkolwiek","jako","jakoś","je","jeden","jedna","jedno","jednak","jednakże","jego","jej","jemu","jest","jestem","jeszcze","jeśli","jeżeli","już","ją","każdy","kiedy","kilka","kimś","kto","ktokolwiek","ktoś","która","które","którego","której","który","których","którym","którzy","ku","lat","lecz","lub","ma","mają","mało","mam","mi","mimo","między","mną","mnie","mogą","moi","moim","moja","moje","może","możliwe","można","mój","mu","musi","my","na","nad","nam","nami","nas","nasi","nasz","nasza","nasze","naszego","naszych","natomiast","natychmiast","nawet","nią","nic","nich","nie","niech","niego","niej","niemu","nigdy","nim","nimi","niż","no","o","obok","od","około","on","ona","one","oni","ono","oraz","oto","owszem","pan","pana","pani","po","pod","podczas","pomimo","ponad","ponieważ","powinien","powinna","powinni","powinno","poza","prawie","przecież","przed","przede","przedtem","przez","przy","roku","również","sam","sama","są","się","skąd","sobie","sobą","sposób","swoje","ta","tak","taka","taki","takie","także","tam","te","tego","tej","temu","ten","teraz","też","to","tobą","tobie","toteż","trzeba","tu","tutaj","twoi","twoim","twoja","twoje","twym","twój","ty","tych","tylko","tym","u","w","wam","wami","was","wasz","wasza","wasze","we","według","wiele","wielu","więc","więcej","wszyscy","wszystkich","wszystkie","wszystkim","wszystko","wtedy","wy","właśnie","z","za","zapewne","zawsze","ze","zł","znowu","znów","został","żaden","żadna","żadne","żadnych","że","żeby")

# alimony
l <- fromJSON("alimony.json")
o1 <- cbind( data.frame( judgmentId = l$judgmentId), l$value ) # spłaszczenie

# dociągnięcie pozostałych danych
if(FALSE) {
  l2 <- get_judgments(l$judgmentId)
  saveRDS(l2, file="alimenty-full.rds")
}
l2 <- readRDS("alimenty-full.rds")
o2 <- ldply(l2, function(x) expand.grid(id=x$id, text=extractHTMLStrip(x$textContent), judge=sapply(x$judges, "[[", "name")) )
ds <- DataframeSource(o2)
class(o2)
corpus <- VCorpus(ds)
summary(corpus)
print("Corpus created")
corpus <- tm_map(corpus, content_transformer(tolower))
print("Tolower finished")
corpus <- tm_map(corpus, content_transformer(removeNumbers))
print("RemoveNumbers finished")
corpus <- tm_map(corpus, content_transformer(removeWords), polishStopWords)
print("Removing stopwords finished")
corpus <- tm_map(corpus, content_transformer(stripWhitespace))
print("Strip whitespace finished")
dtm <- DocumentTermMatrix(corpus)

o2$imie <- sapply(strsplit(o2$judge, " "), "[", 1)
o2$kobieta <- substr( o2$imie, start=nchar(o2$imie), stop=nchar(o2$imie) ) == "a"
o2$kobieta[ grepl("\\.", o2$imie) ] <- NA
o2u <- o2 %>% group_by(id) %>% summarise(pkobieta = mean(kobieta, na.rm=TRUE))

# Połączenie
alimenty <- sqldf("select o1.*, o2u.pkobieta from o1 left join o2u on o1.judgmentId=o2u.id")
svnames <- c("result", "defendantSex")
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


