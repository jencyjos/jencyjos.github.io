
import SwiftUI
import Combine

struct Stock: Codable {
    var ticker: String
    var name: String
    var shares: Int
    var averageCost: Double
    
}

class PortfolioViewModel: ObservableObject {
    @Published var stock: Stock?
    @Published var isLoading: Bool = true
    
    
    private var cancellables: Set<AnyCancellable> = []
    
    func fetchPortfolio(for ticker: String, completion: @escaping (Stock?) -> Void) {
        isLoading = true
        let url = URL(string: "https://assignment-3-419020.wl.r.appspot.com/api/portfolio")!
        
        URLSession.shared.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: [String: [Stock]].self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { [weak self] completionStatus in
                switch completionStatus {
                case .failure(let error):
                    print("Error occurred: \(error)")
                    self?.isLoading = false
                    completion(nil)
                case .finished:
                    self?.isLoading = false
                }
            }, receiveValue: { [weak self] decodedResponse in
                guard let stocks = decodedResponse["stocks"], let stock = stocks.first(where: { $0.ticker == ticker }) else {
                    
                    completion(nil)
                    return
                }
                self?.stock = stock
                
                completion(stock)
            })
            .store(in: &cancellables)
    }
    
}

struct PortfolioView: View {
    @StateObject var viewModel = PortfolioViewModel()
    var stock: Stock?
    var quote: StockDetailView.StockQuote
    var ticker : String
    var name: String
    
    
    var body: some View {
        VStack(alignment: .leading) {
            PortfolioDataView(stock: viewModel.stock, quote: quote, ticker: ticker, name: name)
            
        }
    }
}




struct PortfolioDataView: View {
    @State private var showingTradeSheet = false
    @State var stock: Stock?
    @StateObject var portfolioViewModel = PortfolioViewModel()
    
    var quote: StockDetailView.StockQuote
    var ticker: String
    var name: String
    var totalCost: Double 
    {
        Double(stock?.shares ?? 0) * (stock?.averageCost ?? 0)
        
        
    }
    var marketValue: Double 
    {
        Double(stock?.shares ?? 0) * (quote.c)
    }
    var change: Double {
        marketValue - totalCost
    }
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Portfolio")
                .font(.title)
            HStack{
                VStack(alignment: .leading, spacing: 5) {
                    if let stock = stock{
                        
                        Text("Shares Owned: \(stock.shares)").font(.subheadline)
                            .bold()
                        Text("Avg.Cost/Share: \(stock.averageCost ?? 0, specifier: "%.2f")")
                            .bold().font(.subheadline)
                        
                        Text("Total Cost: \(totalCost, specifier: "%.2f")")
                            .bold().font(.subheadline)
                        HStack {
                            Text("Change: ")
                                .bold().font(.subheadline)
                            Text("\(change >= 0 ? "+" : "")\(change, specifier: "%.2f")")
                                .foregroundColor(change >= 0 ? .green : .red).font(.subheadline)
                        }
                        Text("Market Value: \(marketValue, specifier: "%.2f")")
                            .bold().font(.subheadline)
                    }else {
                        Text("You have no shares of \(ticker). Start trading!")
                            .bold().font(.subheadline)
                        
                    }
                    
                }
                TradeButton(showingTradeSheet: $showingTradeSheet, stock: stock, quote:quote, name: name, ticker: ticker)
            }
            
        }.onReceive(timer) { _ in
            portfolioViewModel.fetchPortfolio(for: ticker){pf in
                
                stock=pf
                
            }
        }
        
    }
}


struct TradeButton: View{
    @Binding var showingTradeSheet: Bool
    var stock: Stock?
    var quote: StockDetailView.StockQuote
    var name: String
    var ticker: String
    var body: some View{
        Button(action: {
            
            showingTradeSheet = true
        }) {
            Text("Trade")
                .bold()
                .padding()
                .frame(minWidth: 90)
                .foregroundColor(.white)
                .background(Color.green)
                .cornerRadius(20)
        }
        .padding(.trailing)
        .frame(maxWidth: .infinity, alignment: .trailing)
        .sheet(isPresented: $showingTradeSheet) {
            TradeSheetView(isPresented: $showingTradeSheet, stock:stock, sharePrice:quote.c, name:name, ticker: ticker)
        }
    }
}



