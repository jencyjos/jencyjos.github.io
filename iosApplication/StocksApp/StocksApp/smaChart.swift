import Foundation
import SwiftUI
import WebKit

struct SMAData: Codable {
    var stockPriceData: [[Double]]
    var volumeData: [[Double]]
}

struct SMAChartView: View {
    @State private var htmlContent: String = ""
    @State private var isLoading = true
    var ticker: String
    init(ticker: String) {
        self.ticker = ticker
    }
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView()
            } else {
                WebView(htmlString: htmlContent)
                    .frame(minHeight: 300, maxHeight: .infinity)
                
            }
        }
        .onAppear {
            loadData()
        }
    }
    
    private func loadData() {
        let urlString = "https://assignment-3-419020.wl.r.appspot.com/api/stock/sma/\(ticker)"
        guard let url = URL(string: urlString) else {
            print("Invalid URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let data = data {
                do {
                    let decodedData = try JSONDecoder().decode(SMAData.self, from: data)
                    DispatchQueue.main.async {
                        self.htmlContent = self.generateHTML(smaData: decodedData)
                        self.isLoading = false
                    }
                } catch {
                    print("Decoding error: \(error)")
                }
            } else if let error = error {
                print("HTTP error: \(error)")
            }
        }.resume()
    }
    
    private func generateHTML(smaData: SMAData) -> String {
        let jsonData = try! JSONEncoder().encode(smaData)
        let jsonStr = String(data: jsonData, encoding: .utf8) ?? "{}"
        
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>SMA Chart</title>
          <script src="https://code.highcharts.com/stock/highstock.js"></script>
          <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
          <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script>
          <script src="https://code.highcharts.com/stock/indicators/volume-by-price.js"></script>
          <script src="https://code.highcharts.com/stock/indicators/sma.js"></script>
        </head>
        <body>
        <div id="container" style="height: 400px; min-width: 310px"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const smaData = \(jsonStr);
            drawSMAChart(smaData);
          });
        
          function drawSMAChart(smaData) {
            Highcharts.stockChart('container', {
              // Highcharts options
              // Add the rest of the Highcharts options here using smaData
          accessibility: {
                enabled: false
              },
              legend: {
                enabled: false
              },
              exporting: {
                enabled: true
              },
              rangeSelector: {
                enabled: true,
                inputEnabled: true,
                allButtonsEnabled: true,
                selected: 2,
                buttons: [
                  { type: 'month', count: 1, text: '1m', title: 'View 1 month' },
                  { type: 'month', count: 3, text: '3m', title: 'View 3 months' },
                  { type: 'month', count: 6, text: '6m', title: 'View 6 months' },
                  { type: 'ytd', text: 'YTD', title: 'View year to date' },
                  { type: 'year', count: 1, text: '1y', title: 'View 1 year' },
                  { type: 'all', text: 'All', title: 'View all' }
                ]
              },
              title: {
                text: '\(ticker) Historical'
              },
              subtitle: {
                text: 'With SMA and Volume by Price technical indicators'
              },
              navigator: {
                enabled: true
              },
              xAxis: {
                type: 'datetime'
              },
              yAxis: [{
                opposite: true,
                startOnTick: false,
                endOnTick: false,
                labels: {
                  align: 'right',
                  x: -3
                },
                title: {
                  text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2,
                resize: {
                  enabled: true
                }
              }, {
                opposite: true,
                labels: {
                  align: 'right',
                  x: -3
                },
                title: {
                  text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
              }],
              tooltip: {
                split: true
              },
              plotOptions: {
                series: {
                  dataGrouping: {
                    units: [['week', [2]], ['month', [1, 2, 3, 4, 6]]]
                  }
                }
              },
              series: [{
                type: 'candlestick',
                name: 'AAPL',
                id: 'aapl',
                zIndex: 2,
                data: smaData['stockPriceData']
              }, {
                type: 'column',
                name: 'Volume',
                id: 'volume',
                data: smaData['volumeData'],
                yAxis: 1
              }, {
                type: 'vbp',
                linkedTo: 'aapl',
                params: {
                  volumeSeriesID: 'volume'
                },
                dataLabels: {
                  enabled: false
                },
                zoneLines: {
                  enabled: false
                }
              }, {
                type: 'sma',
                linkedTo: 'aapl',
                zIndex: 1,
                marker: {
                  enabled: false
                }
              }]
            });
          }
        </script>
        </body>
        </html>
        """
    }
}

struct SMAChartView_Previews: PreviewProvider {
    static var previews: some View {
        SMAChartView(ticker: "AAPL") 
    }
}


