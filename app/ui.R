library(shiny)
library(saos)

d3_visualisation <- function (outputId) 
{
  HTML(paste("<div id=\"", outputId, "\" class=\"shiny-network-output\"></div>", sep=""))
}

shinyUI(navbarPage("Alimenty",
                   tabPanel("Jednowymiarowa analiza",
                            sidebarLayout(
                              sidebarPanel(
                                radioButtons("oneDimAnalysis", "Cecha do analizy",
                                             c("Apelacja"="isAppeal", 
                                               "Powód sprawy"="reason",
                                               "Wyrok sprawy"="result",
                                               "Płeć powoda"="plaintiffSex",
                                               "Płeć pozwanego"="defendantSex",
                                               "Płeć składu sędziowskiego"="pkobieta")
                                ),
                                p("Wizualizacja orzeczeń w sprawach sądowych o alimenty. Opiera się na 1002 orzeczeniach, pobranych z systemu SAOS."),
                                img(src="img/icm-logo.png", width="50px")
                              ),
                              mainPanel(
                                d3_visualisation(outputId = "oneDimVisualisation")
                              )
                            )
                   ),
                   tabPanel("Dwuwymiarowa analiza",
                            sidebarLayout(
                              sidebarPanel(
                                radioButtons("twoDimAnalysis_1", "Grupuj według",
                                             c("Apelacja"="isAppeal", 
                                               "Powód sprawy"="reason",
                                               "Wyrok sprawy"="result",
                                               "Płeć powoda"="plaintiffSex",
                                               "Płeć pozwanego"="defendantSex",
                                               "Płeć składu sędziowskiego"="pkobieta")
                                ),
                                radioButtons("twoDimAnalysis_2", "Analizuj grupy według",
                                             c("Apelacja"="isAppeal", 
                                               "Powód sprawy"="reason",
                                               "Wyrok sprawy"="result",
                                               "Płeć powoda"="plaintiffSex",
                                               "Płeć pozwanego"="defendantSex",
                                               "Płeć składu sędziowskiego"="pkobieta")
                                ),
                                p("Wizualizacja orzeczeń w sprawach sądowych o alimenty. Opiera się na 1002 orzeczeniach, pobranych z systemu SAOS."),
                                img(src="img/icm-logo.png", width="50px")
                              ),
                              mainPanel(
                                d3_visualisation(outputId = "twoDimVisualisation")
                              )
                            )
                   ),
                   #navbarMenu("Modele",
                  #            tabPanel("TBD",
                  #                     dataTableOutput("table")
                  #            )
                  # ),
                   tags$head(tags$link(rel = "stylesheet", type = "text/css", href = "css/c3.min.css")),
                   tags$head(tags$script(src="js/stackedBarChart.js")),
                   tags$head(tags$script(src="js/barChart.js")),
                   tags$head(tags$script(src="js/vis.js")),
                   tags$head(tags$script(src="js/d3.min.js")),
                   tags$head(tags$script(src="js/c3.min.js"))
))