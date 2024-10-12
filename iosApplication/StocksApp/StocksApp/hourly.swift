import Foundation
import SwiftUI
import WebKit

struct HourlyData: Codable {
    let stockPriceData: [[Double]]
    let volumeData: [[Double]]
}

struct HourlyChartView: View {
    @StateObject var viewModel = HourlyChartViewModel()
    let ticker: String
    
    var body: some View {
        VStack {
            if viewModel.isLoading {
                ProgressView()
            } else {
                WebView(htmlString: viewModel.htmlContent)
                    .frame(minHeight: 300, maxHeight: .infinity)
            }
        }
        .onAppear {
            viewModel.loadData(for: ticker)
        }
    }
}

class HourlyChartViewModel: ObservableObject {
    @Published var htmlContent: String = ""
    @Published var isLoading: Bool = false
    
    func loadData(for ticker: String) {
        isLoading = true
        
        let toDate = Date()
        let fromDate = Calendar.current.date(byAdding: .day, value: -1, to: toDate)!
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let fromDateString = formatter.string(from: fromDate)
        let toDateString = formatter.string(from: toDate)
        
        
        let urlString = "https://assignment-3-419020.wl.r.appspot.com/api/stock/historical/\(ticker)?from=\(fromDateString)&to=\(toDateString)"
        guard let url = URL(string: urlString) else {
            print("Invalid URL")
            isLoading = false
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, _, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let data = data {
                    do {
                        let decodedData = try JSONDecoder().decode(HourlyData.self, from: data)
                        self?.htmlContent = self?.generateHTML(for: decodedData, ticker: ticker) ?? ""
                    } catch {
                    }
                } else if let error = error {
                    print("HTTP error: \(error)")
                }
            }
        }.resume()
    }
    
    private func generateHTML(for data: HourlyData, ticker: String) -> String {
        guard let stockPriceDataString = String(data: try! JSONEncoder().encode(data.stockPriceData), encoding: .utf8) else {
            print("Failed to encode stock price data to JSON")
            return ""
        }
        
        let chartColor = data.stockPriceData.last?.last ?? 0 >= 0 ? "green" : "red"
        
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>\(ticker) Hourly Price Chart</title>
            <script src="https://code.highcharts.com/stock/highstock.js"></script>
            <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
        </head>
        <body>
        <div id="chartContainer" style="height: 400px; min-width: 310px"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM fully loaded and parsed');
            try {
              const data = \(stockPriceDataString);
        
              Highcharts.stockChart('chartContainer', {
                rangeSelector: {
                                enabled: false
                            },
                title: {
                  text: '\(ticker) Hourly Price Variation'
                },
         navigator: {
                        enabled: false
                    },
                    scrollbar: {
                        enabled: true
                    },
                xAxis: {
                  type: 'datetime',
                  dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
                    year: '%b'
                  },
                 
                },
                yAxis: [{
                  labels: {
                    align: 'right',
                    x: -3
                  },
                  
                  height: '100%',
                  lineWidth: 2,
                  opposite: true
                }],
                series: [{
                  name: '\(ticker)',
                  data: data,
                  tooltip: {
                    valueDecimals: 2
                  },
                  color: '\(chartColor)',
                  fillColor: {
                    linearGradient: {
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1
                    },
                    stops: [
                      [0, Highcharts.getOptions().colors[0]],
                      [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                  }
                }]
              });
            } catch (error) {
              console.error('Error generating chart:', error);
            }
          });
        </script>
        </body>
        </html>
        """
    }
    
    
    
}

struct HourlyChartView_Previews: PreviewProvider {
    static var previews: some View {
        HourlyChartView(ticker: "AAPL")
    }
}




