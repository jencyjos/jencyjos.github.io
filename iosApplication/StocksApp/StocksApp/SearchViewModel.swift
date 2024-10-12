
import Foundation
import Combine


class SearchViewModel: ObservableObject {
    @Published var searchQuery = ""
    @Published var searchResults: [SearchResult] = []
    @Published var isSearching = false
    private var baseUrl = "https://assignment-3-419020.wl.r.appspot.com/api/autocomplete"
    @Published var selectedSymbol: String?
    
    
    func searchStocks() {
        guard !searchQuery.isEmpty else {
            searchResults = []
            return
        }
        print("Searching for: \(searchQuery)")
        isSearching = true
        let query = searchQuery.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "\(baseUrl)/\(query)"
        
        guard let url = URL(string: urlString) else {
            print("Invalid URL")
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                
                if let error = error {
                    print("Error fetching data: \(error.localizedDescription)")
                    return
                }
                
                guard let data = data else {
                    print("No data received")
                    return
                }
                
                do {
                    let results = try JSONDecoder().decode([SearchResult].self, from: data)
                    self?.searchResults = results
                    print("Search results: \(self?.searchResults.map { $0.displaySymbol } ?? [])")
                } catch {
                    print("Error decoding JSON: \(error.localizedDescription)")
                }
            }
        }.resume()
    }
}

struct SearchResult: Decodable, Identifiable,Hashable {
    var id: String { symbol }
    let description: String
    let displaySymbol: String
    let symbol: String
    let type: String
}

