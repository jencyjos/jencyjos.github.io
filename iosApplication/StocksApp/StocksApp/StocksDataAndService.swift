import Foundation
import Combine

struct WatchlistItem: Codable, Identifiable {
    let id: String
    let ticker: String
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeIfPresent(String.self, forKey: .id) ?? UUID().uuidString
        ticker = try container.decode(String.self, forKey: .ticker)
    }
}
struct StockQuote: Codable {
    let c: Double
    let d: Double
    let dp: Double
}

struct StockDetail: Codable {
    let name: String
}

struct FavoriteStock: Identifiable {
    let id: String
    let ticker: String
    let name: String
    let c: Double
    let d: Double
    let dp: Double
}

class WatchlistViewModel: ObservableObject {
    @Published var watchlist: [FavoriteStock] = []
    private var cancellables: Set<AnyCancellable> = []
    private let stockService = StockService()
    func loadWatchlist() {
        stockService.getWatchlist()
            .flatMap { items in
                Publishers.MergeMany(items.map { self.stockService.getDetailsAndQuote(for: $0.ticker) })
                    .collect()
            }
            .receive(on: DispatchQueue.main)
            .sink(receiveCompletion: { completion in
                switch completion {
                case .finished:
                    print("Fetching and decoding successful")
                case .failure(let error):
                    print("An error occurred: \(error)")
                }
            }, receiveValue: { [weak self] stocks in
                self?.watchlist = stocks
                print("Received stocks: \(stocks)")
            })
            .store(in: &cancellables)
        
    }
    func moveWatchlistItem(from source: IndexSet, to destination: Int) {
        watchlist.move(fromOffsets: source, toOffset: destination)
        // Here you can add code to save the updated order to the backend or local storage
    }
}

class StockService {
    func getWatchlist() -> AnyPublisher<[WatchlistItem], Error> {
        guard let url = URL(string: "https://assignment-3-419020.wl.r.appspot.com/api/watchlist") else {
            return Fail(error: URLError(.badURL)).eraseToAnyPublisher()
        }
        
        return URLSession.shared.dataTaskPublisher(for: url)
            .print("Debug:")
            .tryMap { output in
                guard let response = output.response as? HTTPURLResponse, response.statusCode == 200 else {
                    throw URLError(.badServerResponse)
                }
                return output.data
            }
            .decode(type: [WatchlistItem].self, decoder: JSONDecoder())
            .receive(on: RunLoop.main)
            .eraseToAnyPublisher()
    }
    
    private var cancellables = Set<AnyCancellable>()
    
    func getDetailsAndQuote(for ticker: String) -> AnyPublisher<FavoriteStock, Error> {
        let detailsURL = URL(string: "https://assignment-3-419020.wl.r.appspot.com/api/stock/details/\(ticker)")!
        let quoteURL = URL(string: "https://assignment-3-419020.wl.r.appspot.com/api/stock/quote/\(ticker)")!
        
        let detailsPublisher = URLSession.shared.dataTaskPublisher(for: detailsURL)
            .map(\.data)
            .decode(type: StockDetail.self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
        
        let quotePublisher = URLSession.shared.dataTaskPublisher(for: quoteURL)
            .map(\.data)
            .decode(type: StockQuote.self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
        
        return Publishers.Zip(detailsPublisher, quotePublisher)
            .map { details, quote in
                return FavoriteStock(id: UUID().uuidString, ticker: ticker, name: details.name, c: quote.c, d: quote.d, dp: quote.dp)
            }
            .eraseToAnyPublisher()
    }
}
