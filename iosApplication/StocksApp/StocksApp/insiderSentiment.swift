
import SwiftUI

struct InsiderSentiment: Codable {
    let changeAggregates: ChangeAggregate
    let msprAggregates: MsprAggregate
    
    struct ChangeAggregate: Codable {
        let totalChange: Double
        let positiveChange: Double
        let negativeChange: Double
    }
    
    struct MsprAggregate: Codable {
        let totalMspr: Double
        let positiveMspr: Double
        let negativeMspr: Double
    }
}
struct InsiderSentimentView: View {
    var sentiments: InsiderSentiment
    var ticker: String
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Insights")
                .font(.title)
            HStack {
                Spacer()
                Text("Insider Sentiments")
                    .font(.title2)
                    .padding(.bottom, 5)
                Spacer()
            }
            
            Divider()
            
            HStack {
                Text(ticker)
                    .bold()
                Spacer()
                Text("MSPR")
                    .bold()
                Spacer()
                Text("Change")
                    .bold()
            }
            
            Divider()
            
            HStack {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Total")
                    Text("Positive")
                    Text("Negative")
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 10) {
                    Text("\(sentiments.msprAggregates.totalMspr, specifier: "%.2f")")
                    Text("\(sentiments.msprAggregates.positiveMspr, specifier: "%.2f")")
                    Text("\(sentiments.msprAggregates.negativeMspr, specifier: "%.2f")")
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 10) {
                    Text("\(sentiments.changeAggregates.totalChange, specifier: "%.2f")")
                    Text("\(sentiments.changeAggregates.positiveChange, specifier: "%.2f")")
                    Text("\(sentiments.changeAggregates.negativeChange, specifier: "%.2f")")
                }
            }
        }
        .padding()
    }
}



