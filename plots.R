library(ggplot2)
p <- ggplot(subset(wf, freq>2000), aes(word, freq))
p <- p + geom_bar(stat="identity")
p <- p + theme(axis.text.x=element_text(angle=45, hjust=1))
p

plot(dtm, terms=findFreqTerms(dtm, lowfreq=1000)[1:30], corThreshold=0.5, cex=5.5)

set.seed(123)
wordcloud(names(freq), freq, min.freq=100)
wordcloud(names(freq), freq, max.words=100)

findAssocs(x = dtm, terms = "alimenty", corlimit = 0.5)