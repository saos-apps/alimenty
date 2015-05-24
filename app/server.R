library(shiny)
library(rjson)
# Define server logic required to draw a histogram
shinyServer(function(input, output, session) {
  analysis <- fromJSON(file="www/data/analysis.json")
  
  output$oneDimVisualisation <- reactive({
    # creating a dependency on action button
    input$oneDimAnalysis
    selected <- input$oneDimAnalysis
    data <- list()
    data$data <- analysis$coverage[selected]
    data$name <- input$oneDimAnalysis
    data$length <- analysis$dataLength
    data
  })
  
})