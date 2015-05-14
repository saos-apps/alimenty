library(DBI)
library(tm)
library(rjson)
library(saos)
library(tm.plugin.webmining)
library(wordcloud)
library(SnowballC)

polishStopWords <- c("a","aby","ach","acz","aczkolwiek","aj","albo","ale","ależ","ani","aż","bardziej","bardzo","bo","bowiem","by","byli","bynajmniej","być","był","była","było","były","będzie","będą","cali","cała","cały","ci","cię","ciebie","co","cokolwiek","coś","czasami","czasem","czemu","czy","czyli","daleko","dla","dlaczego","dlatego","do","dobrze","dokąd","dość","dużo","dwa","dwaj","dwie","dwoje","dziś","dzisiaj","gdy","gdyby","gdyż","gdzie","gdziekolwiek","gdzieś","i","ich","ile","im","inna","inne","inny","innych","iż","ja","ją","jak","jakaś","jakby","jaki","jakichś","jakie","jakiś","jakiż","jakkolwiek","jako","jakoś","je","jeden","jedna","jedno","jednak","jednakże","jego","jej","jemu","jest","jestem","jeszcze","jeśli","jeżeli","już","ją","każdy","kiedy","kilka","kimś","kto","ktokolwiek","ktoś","która","które","którego","której","który","których","którym","którzy","ku","lat","lecz","lub","ma","mają","mało","mam","mi","mimo","między","mną","mnie","mogą","moi","moim","moja","moje","może","możliwe","można","mój","mu","musi","my","na","nad","nam","nami","nas","nasi","nasz","nasza","nasze","naszego","naszych","natomiast","natychmiast","nawet","nią","nic","nich","nie","niech","niego","niej","niemu","nigdy","nim","nimi","niż","no","o","obok","od","około","on","ona","one","oni","ono","oraz","oto","owszem","pan","pana","pani","po","pod","podczas","pomimo","ponad","ponieważ","powinien","powinna","powinni","powinno","poza","prawie","przecież","przed","przede","przedtem","przez","przy","roku","również","sam","sama","są","się","skąd","sobie","sobą","sposób","swoje","ta","tak","taka","taki","takie","także","tam","te","tego","tej","temu","ten","teraz","też","to","tobą","tobie","toteż","trzeba","tu","tutaj","twoi","twoim","twoja","twoje","twym","twój","ty","tych","tylko","tym","u","w","wam","wami","was","wasz","wasza","wasze","we","według","wiele","wielu","więc","więcej","wszyscy","wszystkich","wszystkie","wszystkim","wszystko","wtedy","wy","właśnie","z","za","zapewne","zawsze","ze","zł","znowu","znów","został","żaden","żadna","żadne","żadnych","że","żeby")
judgements <- readRDS(file='alimenty-full.rds')
i = 1;
while (i <= length(judgements))
{
  text <- extractHTMLStrip(judgements[[i]]$textContent)
  text <- gsub("aliment\\w+", "alimenty", text)
  if (i == 1)
    docs <- c(text)
  else
    docs <- c(text, docs)
  i = i+1
}
corpus <- Corpus(VectorSource(docs))
print("Corpus created")
corpus <- tm_map(corpus, content_transformer(tolower))
print("Tolower finished")
corpus <- tm_map(corpus, content_transformer(removeNumbers))
print("RemoveNumbers finished")
corpus <- tm_map(corpus, content_transformer(removeWords), polishStopWords)
print("Removing stopwords finished")
corpus <- tm_map(corpus, content_transformer(stripWhitespace))
print("Strip whitespace finished")
corpus <- tm_map(corpus, removePunctuation)
print("Remove punctuation finished")

dtm <- DocumentTermMatrix(corpus)
tdm <- TermDocumentMatrix(corpus)

freq <- sort(colSums(as.matrix(dtm)), decreasing=TRUE)
wf   <- data.frame(word=names(freq), freq=freq)