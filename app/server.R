library(shiny)
library(rjson)
# Define server logic required to draw a histogram
shinyServer(function(input, output, session) {
  categories <- fromJSON(file="www/data/categories.json")
  analysis <- fromJSON(file="www/data/analysis.json")
  alimony <- fromJSON(file="www/data/alimonyMonika.json")
  
  output$oneDimVisualisation <- reactive({
    # creating a dependency on action button
    input$oneDimAnalysis
    
    selected <- input$oneDimAnalysis
    data <- list()
    data$data <- analysis$coverage[selected]
    data$name <- input$oneDimAnalysis
    data$length <- analysis$dataLength
    data$type <- "oneDim"
    data
  })
  
  output$twoDimVisualisation <- reactive({
    # creating a dependency on action button
    input$twoDimAnalysis_1
    input$twoDimAnalysis_2

    data <- list()
    data$data <- alimony
    data$name_1 <- input$twoDimAnalysis_1
    data$name_2 <- input$twoDimAnalysis_2
    data$categories <- categories
    data$length <- analysis$dataLength
    data$type <- "twoDim"
    data
  })
  
})