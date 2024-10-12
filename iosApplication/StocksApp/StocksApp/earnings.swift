import Foundation
import SwiftUI
import WebKit

struct Earnings: Codable, Equatable {
    let period: String
    let actual: Double
    let estimate: Double
    let symbol: String?
    let surprise: String
}

typealias EarningsData = [Earnings]

class EarningsViewModel: ObservableObject {
    @Published var earningsData: EarningsData = []
    @Published var isLoading = false
    
    func loadEarningsData(for ticker: String) {
        isLoading = true
        let urlString = "https://assignment-3-419020.wl.r.appspot.com/api/stock/earnings/\(ticker)"
        
        guard let url = URL(string: urlString) else {
            print("Invalid earnings chart api URL")
            isLoading = false
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, _, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if let error = error {
                    return
                }
                guard let data = data else {
                    return
                }
                do {
                    self?.earningsData = try JSONDecoder().decode(EarningsData.self, from: data)
                } catch {
                    print("EARNINGS: Decoding error: \(error)")
                }
            }
        }.resume()
    }
    
}

struct EarningsChartView: View {
    @StateObject private var viewModel = EarningsViewModel()
    var ticker: String
    
    var body: some View {
        VStack {
            if viewModel.isLoading {
                ProgressView()
            } else {
                WebView(htmlString: generateHTML(for: viewModel.earningsData, ticker: ticker))
                    .frame(minHeight: 300, maxHeight: .infinity)
            }
        }
        .onAppear {
            viewModel.loadEarningsData(for: ticker)
        }
    }
    
    private func generateHTML(for data: EarningsData, ticker: String) -> String {
        guard let jsonData = try? JSONEncoder().encode(data),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return ""
        }
        
        let categories = data.map { "'\($0.period)<br>Surprise: \($0.surprise)'" }.joined(separator: ", ")
        
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Earnings Chart</title>
            <script src="https://code.highcharts.com/highcharts.js"></script>
                  <script src="https://code.highcharts.com/stock/highstock.js"></script>
                  <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
                  <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script>
                  <script src="https://code.highcharts.com/stock/indicators/volume-by-price.js"></script>
                  <script src="https://code.highcharts.com/stock/indicators/sma.js"></script>
        </head>
        <body>
        <div id="earningsChartContainer" style="width:100%; height:400px;"></div>
        <script>
            document.addEventListener('DOMContentLoaded', function () {
                try {
                    const earningsData = JSON.parse('\(jsonString)');
                    console.log("EARNINGS: Parsed earnings data:", earningsData);
        
                    var actualData = earningsData.map(function(item) {
                        return [item.actual];
                    });
                    var estimateData = earningsData.map(function(item) {
                        return [item.estimate];
                    });
        
                    Highcharts.chart('earningsChartContainer', {
                        chart: {
                            type: 'spline'
                        },
                        title: {
                            text: 'Historical EPS Surprises'
                        },
                      exporting: {
                        enabled: true
                      },
                        xAxis: {
                            categories: [\(categories)],
                            crosshair: true
                        },
                        yAxis: {
                            title: {
                                text: 'Quarterly EPS'
                            }
                        },
                        tooltip: {
                            shared: true,
                            formatter: function() {
                                return '<b>' + this.x + '</b><br/>' +
                                       this.points.reduce(function(s, point) {
                                           return s + '<br/>' + point.series.name + ': ' +
                                           point.y;
                                       }, '');
                            }
                        },
                        plotOptions: {
                            spline: {
                                marker: {
                                    enabled: true,
                                    radius: 4
                                }
                            }
                        },
                        series: [{
                            name: 'Actual',
                            data: actualData,
                            color: 'blue'
                        }, {
                            name: 'Estimate',
                            data: estimateData,
                            color: 'purple'
                        }]
                    });
                } catch (error) {
                    console.error('EARNINGS: Error in chart setup:', error);
                }
            });
        </script>
        </body>
        </html>
        """
    }
    
    
}

struct EarningsChartView_Previews: PreviewProvider {
    static var previews: some View {
        EarningsChartView(ticker: "AAPL")
    }
}

