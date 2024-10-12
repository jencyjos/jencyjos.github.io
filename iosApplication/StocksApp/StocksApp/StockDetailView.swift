import SwiftUI
import Foundation
import WebKit
import Kingfisher

let apiBaseURL = "https://assignment-3-419020.wl.r.appspot.com/api"

struct BottomAlertView: View {
    var message: String
    var isVisible: Bool
    
    var body: some View {
        if isVisible {
            Text(message)
                .padding(15)
                .frame(maxWidth: 300)
                .background(Color.gray)
                .foregroundColor(.white)
                .transition(.move(edge: .bottom))
                .zIndex(1)
                .cornerRadius(25)
        }
    }
}

class WatchViewModel: ObservableObject {
    @Published var isFavorite: Bool = false
    @Published var alertMessage: String = ""
    @Published var showAlert: Bool = false
    private var timer: Timer?
    
    func checkFavoriteStatus(for ticker: String) {
        let urlString = "\(apiBaseURL)/watchlist"
        guard let url = URL(string: urlString) else {
            print("Invalid URL for watchlist")
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, _, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("Error fetching watchlist: \(error.localizedDescription)")
                    return
                }
                
                guard let data = data,
                      let watchlist = try? JSONDecoder().decode([WatchlistItem].self, from: data) else {
                    print("Failed to decode watchlist")
                    return
                }
                
                self?.isFavorite = watchlist.contains(where: { $0.ticker == ticker })
            }
        }.resume()
    }
    
    func toggleWatchlist(for ticker: String) {
        let urlString = "\(apiBaseURL)/watchlist/toggle"
        guard let url = URL(string: urlString) else {
            alertMessage = "Invalid URL"
            showAlert = true
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: String] = ["ticker": ticker]
        request.httpBody = try? JSONEncoder().encode(body)
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                guard let self = self else { return }
                
                if let error = error {
                    self.alertMessage = "Network Error: \(error.localizedDescription)"
                    self.showAlert = true
                    return
                }
                
                if let data = data,
                   let response = try? JSONDecoder().decode(WatchlistResponse.self, from: data) {
                    let wasFavorite = self.isFavorite
                    self.isFavorite.toggle()
                    self.alertMessage = wasFavorite ? "Removing \(ticker) from Favorites" : "Adding \(ticker) to Favorites"
                    self.showAlert = true
                    self.dismissA()
                } else {
                    self.alertMessage = "Error parsing response"
                    self.showAlert = true
                }
            }
        }.resume()
    }
    private func dismissA() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { _ in
            DispatchQueue.main.async {
                self.showAlert = false
                self.alertMessage = ""
            }
        }
    }
    
    struct WatchlistItem: Codable {
        let ticker: String
    }
    
    struct WatchlistResponse: Codable {
        let message: String
    }
}


struct StockDetailView: View {
    @StateObject private var watchViewModel = WatchViewModel()
    @State private var companyProfile: CompanyProfile?
    @State private var stockQuote: StockQuote?
    @StateObject private var portfolioViewModel = PortfolioViewModel()
    @State private var showingHourlyChart: Bool = true
    @State private var selectedTab: Int = 0
    @Environment(\.presentationMode) var presentationMode
    @State private var insiderSentiment: InsiderSentiment?
    @StateObject private var newsViewModel = NewsViewModel()
    @State private var showingTradeSheet = false
    @EnvironmentObject var searchViewModel: SearchViewModel
    @State private var activeTicker: String?
    
    var previousTicker: String?
    
    let ticker: String
    
    private var backButton: some View {
        Button(action: {
            self.presentationMode.wrappedValue.dismiss()
        }) {
            HStack {
                Image(systemName: "chevron.left")
                Text(previousTicker ?? "Stocks")
            }
        }
    }
    
    var body: some View {
        ZStack(alignment: .bottom){
            ScrollView(.vertical, showsIndicators: true) {
                VStack(alignment: .leading, spacing: 7) {
                    if let profile = companyProfile, let quote = stockQuote {
                        VStack(alignment: .leading) {
                            Text(ticker)
                                .font(.largeTitle)
                                .fontWeight(.bold)
                            
                            HStack{
                                Text(profile.name)
                                    .font(.subheadline)
                                    .foregroundColor(Color.gray)
                                Spacer()
                                KFImage(URL(string: profile.logo))
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 50, height: 50)
                                    .cornerRadius(15)
                                
                            }
                        }
                        
                        HStack {
                            Text("$\(quote.c, specifier: "%.2f")")
                                .font(.title)
                                .fontWeight(.semibold)
                            
                            Image(systemName: quote.d >= 0 ? "arrow.up.right" : "arrow.down.right")
                                .foregroundColor(quote.d >= 0 ? .green : .red)
                            
                            Text("$\(quote.d >= 0 ? "" : "")\(quote.d, specifier: "%.2f") (\(quote.dp, specifier: "%.2f")%)")
                                .font(.title2)
                                .foregroundColor(quote.d >= 0 ? .green : .red)
                                .fontWeight(.semibold)
                        }
                        .padding(.bottom)
                    }
                    TabView(selection: $selectedTab) {
                        HourlyChartView(ticker: ticker)
                            .tabItem {
                                Label("Hourly", systemImage: "chart.xyaxis.line")
                            }
                            .tag(0)
                        
                        SMAChartView(ticker: ticker)
                            .tabItem {
                                Label("Historical", systemImage: "clock.fill")
                            }
                            .tag(1)
                    }
                    .frame(height: 480)
                    
                    if portfolioViewModel.isLoading {
                        ProgressView("Loading...")
                    }
                    else{
                        if let quote = stockQuote, let profile = companyProfile{
                            PortfolioView(viewModel: portfolioViewModel, quote: quote, ticker: ticker, name: profile.name)
                        }
                    }
                    
                    if let quote = stockQuote {
                        StatsView(high: quote.h, low: quote.l, open: quote.o, prevClose: quote.pc)
                    }
                    
                    
                    if let profile = companyProfile {
                        AboutView(ipoDate: profile.ipo,
                                  industry: profile.finnhubIndustry,
                                  webpageURL: profile.weburl,
                                  peers: profile.peers ?? [],
                                  ticker: ticker,
                                  onPeerTap: { peerTicker in
                            // Handling navigation when a peer is tapped
                            self.activeTicker = peerTicker
                            // You might need to manage the navigation stack or update the view here
                        })
                    }
                    
                    if let sentiment = insiderSentiment {
                        InsiderSentimentView(sentiments: sentiment, ticker: ticker)
                    }
                    
                    RecommendationChartView().frame(height: 440)
                    
                    EarningsChartView(ticker: ticker).frame(height: 440)
                    
                    
                    NewsView(viewModel: newsViewModel, ticker: ticker)
                    
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal)
            }
            .navigationBarItems(trailing: favButton)
            .navigationBarTitleDisplayMode(.inline)
            .navigationTitle(ticker)
            .onAppear {
                
                watchViewModel.checkFavoriteStatus(for: ticker)
                
                fetchCompanyProfile(ticker: ticker) { result in
                    switch result {
                    case .success(let profile):
                        self.companyProfile = profile
                    case .failure(let error):
                        print("An error occurred while fetching the company profile: \(error.localizedDescription)")
                    }
                }
                fetchCompanyPeers()
                
                fetchStockQuote(ticker: ticker) { result in
                    switch result {
                    case .success(let quote):
                        self.stockQuote = quote
                    case .failure(let error):
                        print("An error occurred while fetching the stock quote: \(error.localizedDescription)")
                    }
                }
                portfolioViewModel.fetchPortfolio(for: ticker){s in }
                fetchInsiderSentiment()
                newsViewModel.fetchNews(for: ticker)
            }
            
            if(watchViewModel.showAlert){
                BottomAlertView(message: watchViewModel.alertMessage, isVisible: watchViewModel.showAlert)
                    .padding(.bottom, 10)
                    .cornerRadius(25)
                    .transition(.move(edge: .bottom))
            }
            
        }
        
    }
    
    func fetchCompanyProfile(ticker: String, completion: @escaping (Result<CompanyProfile, Error>) -> Void) {
        let companyProfileURL = "\(apiBaseURL)/stock/profile/\(ticker)"
        guard let url = URL(string: companyProfileURL) else {
            completion(.failure(NetworkError.invalidURL))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
                return
            }
            
            guard let data = data else {
                DispatchQueue.main.async {
                    completion(.failure(NetworkError.noData))
                }
                return
            }
            
            do {
                let decoder = JSONDecoder()
                let profile = try decoder.decode(CompanyProfile.self, from: data)
                DispatchQueue.main.async {
                    completion(.success(profile))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }.resume()
    }
    
    func fetchStockQuote(ticker: String, completion: @escaping (Result<StockQuote, Error>) -> Void) {
        let stockQuoteURL = "\(apiBaseURL)/stock/quote/\(ticker)"
        guard let url = URL(string: stockQuoteURL) else {
            completion(.failure(NetworkError.invalidURL))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
                return
            }
            
            guard let data = data else {
                DispatchQueue.main.async {
                    completion(.failure(NetworkError.noData))
                }
                return
            }
            
            do {
                let decoder = JSONDecoder()
                let quote = try decoder.decode(StockQuote.self, from: data)
                DispatchQueue.main.async {
                    completion(.success(quote))
                }
            } catch {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
            }
        }.resume()
    }
    func fetchInsiderSentiment() {
        let sentimentURL = URL(string: "\(apiBaseURL)/stock/insider-sentiment/\(ticker)")!
        URLSession.shared.dataTask(with: sentimentURL) { data, response, error in
            if let error = error {
                print("Error fetching insider sentiment: \(error.localizedDescription)")
                return
            }
            guard let data = data else {
                print("No data received for insider sentiment")
                return
            }
            do {
                let decodedSentiment = try JSONDecoder().decode(InsiderSentiment.self, from: data)
                DispatchQueue.main.async {
                    self.insiderSentiment = decodedSentiment
                }
            } catch {
                print("Error decoding insider sentiment: \(error)")
            }
        }.resume()
    }
    
    enum NetworkError: Error {
        case invalidURL
        case noData
    }
    
    struct CompanyProfile: Codable {
        var ticker: String
        var name: String
        var ipo: String
        var finnhubIndustry: String
        var weburl: String
        var peers: [String]?
        var logo : String
    }
    
    
    struct StockQuote: Codable {
        var c: Double
        var d: Double
        var dp: Double
        var h: Double
        var l: Double
        var o: Double
        var pc: Double
    }
    private var favButton: some View {
        Button(action: {
            watchViewModel.toggleWatchlist(for: ticker)
        }) {
            Image(systemName: watchViewModel.isFavorite ? "plus.circle.fill" : "plus.circle")
                .foregroundColor(watchViewModel.isFavorite ? .blue : .gray)
                .imageScale(.large)
        }
    }
    
}
extension StockDetailView {
    func fetchCompanyPeers() {
        guard let url = URL(string: "\(apiBaseURL)/peers/\(ticker)") else {
            print("Invalid URL for peers")
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            guard let data = data, error == nil else {
                print("Failed to fetch peers: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            
            DispatchQueue.main.async {
                do {
                    let peers = try JSONDecoder().decode([String].self, from: data)
                    self.companyProfile?.peers = peers
                } catch {
                    print("Decoding error for peers: \(error)")
                }
            }
        }.resume()
    }
}



struct StatsView: View {
    var high: Double
    var low: Double
    var open: Double
    var prevClose: Double
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Stats")
                .font(.title)
            
            
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    StatLineView(name: "High Price", value: high)
                    StatLineView(name: "Low Price", value: low)
                }
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 8) {
                    StatLineView(name: "Open Price", value: open)
                    StatLineView(name: "Prev. Close", value: prevClose)
                }
            }
        }
        .padding()
    }
}

struct StatLineView: View {
    var name: String
    var value: Double
    
    var body: some View {
        HStack {
            Text(name + ":")
                .bold()
            Spacer()
            Text("\(value, specifier: "%.2f")")
        }
    }
}


struct AboutView: View {
    var ipoDate: String
    var industry: String
    var webpageURL: String
    var peers: [String]
    var ticker : String
    var onPeerTap: (String) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("About")
                .font(.title)
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text("IPO Start Date:")
                        .bold()
                    Text("Industry:")
                        .bold()
                    Text("Webpage:")
                        .bold()
                    Text("Company Peers:")
                        .bold()
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 8) {
                    Text(ipoDate)
                    Text(industry)
                    Link(webpageURL, destination: URL(string: webpageURL)!)
                        .foregroundColor(.blue)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack {
                            ForEach(peers, id: \.self) { peer in
                                NavigationLink(destination: StockDetailView(previousTicker: ticker, ticker: peer)) {
                                    Text(peer)
                                        .foregroundColor(.blue)
                                }
                                
                                if peer != peers.last {
                                    Text(",")
                                }
                            }
                        }
                    }
                }
            }
        }
        .padding()
    }
}


struct StockDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            StockDetailView(ticker: "AAPL")
        }
    }
}

