import Foundation
import SwiftUI
import WebKit

struct Recommendation: Codable, Equatable {
    let period: String
    let strongBuy, buy, hold, sell, strongSell: Int
}


typealias RecommendationData = [Recommendation]

class RecommendationViewModel: ObservableObject {
    @Published var recommendations: RecommendationData = []
    @Published var isLoading = false
    
    func loadRecommendationData(for ticker: String) {
        isLoading = true
        let urlString = "https://assignment-3-419020.wl.r.appspot.com/api/stock/recommendation/\(ticker)"
        
        guard let url = URL(string: urlString) else {
            print("Invalid URL")
            isLoading = false
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            DispatchQueue.main.async {
                self.isLoading = false
                if let error = error {
                    print("HTTP error: \(error)")
                } else if let data = data {
                    do {
                        self.recommendations = try JSONDecoder().decode(RecommendationData.self, from: data)
                        
                    } catch {
                        print("Decoding error: \(error)")
                    }
                }
            }
        }.resume()
    }
}


struct RecommendationChartView: View {
    @StateObject private var viewModel = RecommendationViewModel()
    @State private var htmlContent = ""
    
    var body: some View {
        VStack {
            if viewModel.isLoading {
                ProgressView()
            } else if !htmlContent.isEmpty {
                WebView(htmlString: htmlContent)
                    .frame(minWidth: 300, maxWidth: .infinity, minHeight: 300, maxHeight: .infinity)
            }
        }
        .onAppear {
            let ticker = "AAPL"
            viewModel.loadRecommendationData(for: ticker)
        }
        .onChange(of: viewModel.recommendations) { newData in
            htmlContent = generateHTML(for: newData)
        }
    }
    
    private func generateHTML(for data: RecommendationData) -> String {
        let jsonEncoder = JSONEncoder()
        guard let jsonData = try? jsonEncoder.encode(data),
              let jsonString = String(data: jsonData, encoding: .utf8)?.replacingOccurrences(of: "\\", with: "\\\\") else {
            return ""
        }
        
        
        let jsStringLiteral = jsonString
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\n", with: "\\n")
        
        
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recommendation Trends</title>
          <script src="https://code.highcharts.com/highcharts.js"></script>
          <script src="https://code.highcharts.com/modules/exporting.js"></script>
          <script src="https://code.highcharts.com/modules/export-data.js"></script>
          <script src="https://code.highcharts.com/modules/accessibility.js"></script>
        <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://code.highcharts.com/highcharts.js"></script>
                    <script src="https://code.highcharts.com/stock/highstock.js"></script>
                    <script src="https://code.highcharts.com/stock/modules/data.js"></script>
                    <script src="https://code.highcharts.com/stock/modules/drag-panes.js"></script>
                    <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
                    <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script>
                    <script src="https://code.highcharts.com/stock/indicators/volume-by-price.js"></script>
        </head>
        <body>
        <div id="container" style="width:100%; height:400px;"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function () {
            // Parse the JSON string back into a JavaScript object.
            var recommendationDataString = '\(jsStringLiteral)';
            var recommendationData = JSON.parse(recommendationDataString);
            
            // Rest of your chart code
                        var categories = recommendationData.map(function (data) {
                          return data.period.slice(0, 7);
                        });
        
                        var series = [
                          {
                            name: 'Strong Buy',
                            type: 'column',
                            data: recommendationData.map(function (data) { return data.strongBuy; }),
                            color: '#008000',
                            stack: 'recommendations'
                          },
                          {
                            name: 'Buy',
                            type: 'column',
                            data: recommendationData.map(function (data) { return data.buy; }),
                            color: '#04af70',
                            stack: 'recommendations'
                          },
                          {
                            name: 'Hold',
                            type: 'column',
                            data: recommendationData.map(function (data) { return data.hold; }),
                            color: '#a68004',
                            stack: 'recommendations'
                          },
                          {
                            name: 'Sell',
                            type: 'column',
                            data: recommendationData.map(function (data) { return data.sell; }),
                            color: 'red',
                            stack: 'recommendations'
                          },
                          {
                            name: 'Strong Sell',
                            type: 'column',
                            data: recommendationData.map(function (data) { return data.strongSell; }),
                            color: '#800080',
                            stack: 'recommendations'
                          }
                        ];
        
                        Highcharts.chart('container', {
                          chart: {
                            type: 'column'
                           
                          },
                          title: {
                            text: 'Recommendation Trends'
                          },
                          xAxis: {
                            categories: categories
                          },
                          yAxis: {
                            min: 0,
                            title: {
                              text: '#Analysis'
                            },
                            stackLabels: {
                              enabled: false,
                              style: {
                                fontWeight: 'bold'
                              }
                            }
                          },
                          tooltip: {
                            shared: false
                          },
                          plotOptions: {
                            column: {
                              stacking: 'normal',
                              dataLabels: {
                                enabled: true,
                                formatter: function () {
                                  return this.y;
                                }
                              }
                            }
                          },
                          series: series,
                          legend: {
                            reversed: true
                          }
                        });
        
          });
        </script>
        </body>
        </html>
        """
    }
    
    
}


struct RecommendationChartView_Previews: PreviewProvider {
    static var previews: some View {
        RecommendationChartView()
    }
}

