
import SwiftUI
import Combine

struct Wallet: Codable {
    var balance: Double
}

struct StockItem: Codable {
    var ticker: String
    var shares: Int
    var averageCost: Double
}

struct PortfolioResponse: Codable {
    var stocks: [StockItem]
}

struct PortfolioItem: Identifiable {
    let id = UUID()
    let symbol: String
    let amount: Int
    let value: Double
    let change: Double
    let percentageChange: Double
}
class FavViewModel: ObservableObject {
    @Published var watchlist: [StockItem] = []
    
    func toggleWatchlist(for ticker: String, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: "\(apiBaseURL)/watchlist/toggle") else {
            print("Invalid URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = ["ticker": ticker]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("Error toggling watchlist item: \(error.localizedDescription)")
                    completion(false)
                    return
                }
                
                guard let data = data,
                      let response = try? JSONDecoder().decode(WatchlistResponse.self, from: data),
                      response.message.contains("removed") else {
                    print("Failed to decode or did not remove from watchlist")
                    completion(false)
                    return
                }
                
                completion(true)
            }
        }.resume()
    }
}

struct WatchlistResponse: Codable {
    let message: String
}



class PortfolioHomeViewModel: ObservableObject {
    @Published var netWorth: Double = 0.0
    @Published var cashBalance: Double = 0.0
    @Published var portfolioData: [PortfolioItem] = []
    
    private var cancellables = Set<AnyCancellable>()
    
    func fetchWalletBalance() {
        guard let url = URL(string: "https://assignment-3-419020.wl.r.appspot.com/api/wallet") else { return }
        
        URLSession.shared.dataTaskPublisher(for: url)
            .tryMap { output in
                guard let response = output.response as? HTTPURLResponse, response.statusCode == 200 else {
                    throw URLError(.badServerResponse)
                }
                
                let rawResponseString = String(data: output.data, encoding: .utf8)
                print("Raw response data: \(rawResponseString ?? "N/A")")
                return output.data
            }
            .decode(type: Wallet.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                if case .failure(let error) = completion {
                    print("Error fetching wallet data: \(error)")
                }
            }, receiveValue: { [weak self] wallet in
                self?.cashBalance = wallet.balance
            })
            .store(in: &cancellables)
    }
    
    func fetchPortfolio() {
        guard let url = URL(string: "https://assignment-3-419020.wl.r.appspot.com/api/portfolio") else { return }
        
        URLSession.shared.dataTaskPublisher(for: url)
            .tryMap { output in
                guard let response = output.response as? HTTPURLResponse, response.statusCode == 200 else {
                    throw URLError(.badServerResponse)
                }
                return output.data
            }
            .decode(type: PortfolioResponse.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                switch completion {
                case .finished:
                    print("Portfolio fetch completed")
                case .failure(let error):
                    print("Error fetching portfolio data: \(error)")
                }
            }, receiveValue: { [weak self] portfolioResponse in
                print("Received portfolio response: \(portfolioResponse)")
                self?.processPortfolioResponse(portfolioResponse)
            })
            .store(in: &cancellables)
    }
    
    func fetchCurrentPrice(for ticker: String) -> AnyPublisher<Double, Error> {
        let quoteURL = URL(string: "https://assignment-3-419020.wl.r.appspot.com/api/stock/quote/\(ticker)")!
        
        return URLSession.shared.dataTaskPublisher(for: quoteURL)
            .map(\.data)
            .decode(type: StockQuote.self, decoder: JSONDecoder())
            .map { $0.c } // Extract the current price
            .eraseToAnyPublisher()
    }
    
    private func processPortfolioResponse(_ portfolioResponse: PortfolioResponse) {
        let priceFetchers = portfolioResponse.stocks.map { stock in
            fetchCurrentPrice(for: stock.ticker)
                .map { (ticker: stock.ticker, price: $0) }
                .catch { _ in Just((ticker: stock.ticker, price: 0.0)) }
        }
        
        Publishers.MergeMany(priceFetchers)
            .collect()
            .sink { _ in
                
            } receiveValue: { [weak self] prices in
                self?.updatePortfolioItems(with: prices, from: portfolioResponse)
            }
            .store(in: &cancellables)
    }
    
    private func updatePortfolioItems(with prices: [(ticker: String, price: Double)], from portfolioResponse: PortfolioResponse) {
        let items = portfolioResponse.stocks.map { stock -> PortfolioItem in
            let currentPrice = prices.first { $0.ticker == stock.ticker }?.price ?? 0
            return PortfolioItem(
                symbol: stock.ticker,
                amount: stock.shares,
                value: currentPrice * Double(stock.shares),
                change: (currentPrice - stock.averageCost) * Double(stock.shares),
                percentageChange: ((currentPrice - stock.averageCost) / stock.averageCost) * 100
            )
        }
        
        DispatchQueue.main.async {
            self.portfolioData = items
            self.calculateNetWorth()
        }
    }
    
    private func calculateNetWorth() {
        let stockValues = portfolioData.map { $0.value }.reduce(0, +)
        self.netWorth = self.cashBalance + stockValues
    }
    
    func movePortfolioItem(from source: IndexSet, to destination: Int) {
        portfolioData.move(fromOffsets: source, toOffset: destination)
        
    }
}


struct HomeView: View {
    @StateObject private var searchViewModel = SearchViewModel()
    @State private var searchText = ""
    @StateObject private var viewModel = WatchlistViewModel()
    @StateObject private var FviewModel = FavViewModel()
    @StateObject private var PviewModel = PortfolioHomeViewModel()
    @State private var isEditing = false
    
    
    var currentDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM d, yyyy"
        return formatter.string(from: Date())
    }
    private func deleteFromFavorites(at offsets: IndexSet) {
        offsets.forEach { index in
            let ticker = viewModel.watchlist[index].ticker
            FviewModel.toggleWatchlist(for: ticker) { success in
                if success {
                    DispatchQueue.main.async {
                        viewModel.watchlist.remove(atOffsets: offsets)
                        print("Removed \(ticker) from favorites")
                    }
                } else {
                    print("Failed to remove \(ticker) from favorites")
                }
            }
        }
    }
    private func moveFavoritesItem(from source: IndexSet, to destination: Int) {
        viewModel.moveWatchlistItem(from: source, to: destination)
    }
    
    private func movePortfolioItem(from source: IndexSet, to destination: Int) {
        PviewModel.movePortfolioItem(from: source, to: destination)
    }
    private var portfolioSection: some View {
        Section(header: Text("PORTFOLIO").bold()) {
            VStack {
                HStack {
                    VStack(alignment: .leading) {
                        Text("Net Worth").font(.title2)
                        Text("$\(PviewModel.netWorth, specifier: "%.2f")").font(.title3).bold()
                    }
                    Spacer()
                    VStack(alignment: .trailing) {
                        Text("Cash Balance").font(.title2)
                        Text("$\(PviewModel.cashBalance, specifier: "%.2f")").font(.title3).bold()
                    }
                }
            }
            .padding(.vertical)
            if !PviewModel.portfolioData.isEmpty {
                ForEach(PviewModel.portfolioData) { item in
                    PortfolioRow(item: item)
                }
                
                .onMove(perform: movePortfolioItem)
            }
            
        }
    }
    
    private var watchlistSection: some View {
        Section(header: Text("FAVORITES")) {
            ForEach(viewModel.watchlist) { stock in
                stockRow(for: stock)
            }
            .onDelete(perform: deleteFromFavorites)
            .onMove(perform: moveFavoritesItem)
        }
    }
    
    
    
    var body: some View {
        NavigationView {
            
            List {
                ForEach(searchViewModel.searchResults, id: \.self) { name in
                    NavigationLink(destination: StockDetailView(ticker: name.displaySymbol)) {
                        
                        VStack(alignment: .leading){
                            Text(name.displaySymbol).bold()
                            
                            Text(name.description).foregroundColor(.gray)
                            
                        }
                        
                    }
                }
                
                if searchText.isEmpty {
                    
                    Text(currentDate).font(.title3).bold().foregroundColor(.gray)
                    
                    portfolioSection
                    watchlistSection
                    
                    Button(action: {
                        if let url = URL(string: "https://www.finnhub.io") {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        Text("Powered by Finnhub.io")
                            .font(.footnote)
                            .foregroundColor(.gray)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
                
                
            }
            .navigationTitle("Stocks")
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    EditButton()
                }
            }
            .onAppear {
                viewModel.loadWatchlist()
                PviewModel.fetchWalletBalance()
                PviewModel.fetchPortfolio()
                
            }
            .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always))
            .onChange(of: searchText) { oldvakue, newValue in
                searchViewModel.searchQuery = newValue
                searchViewModel.searchStocks()
            }
        }
        .environmentObject(searchViewModel)
    }
    
    
}
struct PortfolioRow: View {
    let item: PortfolioItem
    
    var body: some View {
        NavigationLink(destination: StockDetailView(ticker:item.symbol)) {
            HStack {
                VStack(alignment: .leading) {
                    Text(item.symbol).font(.title3).bold()
                    Text("\(item.amount) shares").foregroundColor(.gray)
                }
                Spacer()
                VStack(alignment: .trailing) {
                    Text("$\(item.value, specifier: "%.2f")").bold()
                    HStack(spacing: 4) {
                        Image(systemName: item.change > 0 ? "arrow.up.right" : "arrow.down.right")
                            .foregroundColor(item.change > 0 ? .green : .red)
                        Text("\(item.change, specifier: "%.2f") (\(item.percentageChange, specifier: "%.2f")%)")
                        
                        
                            .foregroundColor(item.change > 0 ? .green : .red)
                    }
                }
            }
        }
    }
}

private func stockRow(for stock: FavoriteStock) -> some View {
    NavigationLink(destination: StockDetailView(ticker: stock.ticker)) {
        HStack {
            VStack(alignment: .leading) {
                Text(stock.ticker).font(.title3).bold()
                Text(stock.name).foregroundColor(.gray)
            }
            Spacer()
            VStack(alignment: .trailing) {
                Text("$\(stock.c, specifier: "%.2f")").bold()
                stockChangeView(stock: stock)
            }
        }
    }
}

private func stockChangeView(stock: FavoriteStock) -> some View {
    HStack(spacing: 4) {
        Image(systemName: stock.d > 0 ? "arrow.up.right" : "arrow.down.right")
            .foregroundColor(stock.d > 0 ? .green : .red)
        Text("\(stock.d, specifier: "%.2f") (\(stock.dp, specifier: "%.2f")%)")
            .foregroundColor(stock.d > 0 ? .green : .red)
    }
}


struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}

