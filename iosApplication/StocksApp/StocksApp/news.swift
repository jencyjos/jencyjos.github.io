import SwiftUI
import Foundation

struct NewsArticle: Identifiable, Codable {
    let id: Int
    let headline: String
    let source: String
    let summary: String
    let url: String
    let image: String
    let datetime: TimeInterval
    var timeAgo: String {
        let publishDate = Date(timeIntervalSince1970: self.datetime)
        let currentDate = Date()
        let components = Calendar.current.dateComponents([.hour, .minute], from: publishDate, to: currentDate)
        
        let hour = components.hour ?? 0
        let minute = components.minute ?? 0
        return "\(hour) hr, \(minute) min"
    }
}

class NewsViewModel: ObservableObject {
    @Published var newsArticles = [NewsArticle]()
    @Published var isLoading = false
    
    func fetchNews(for ticker: String) {
        guard let url = URL(string: "\(apiBaseURL)/stock/news/\(ticker)") else {
            return
        }
        
        isLoading = true
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            DispatchQueue.main.async {
                self.isLoading = false
                if let error = error {
                    print("Error fetching news: \(error.localizedDescription)")
                    return
                }
                
                guard let data = data else {
                    print("No data received for news")
                    return
                }
                
                do {
                    let decodedData = try JSONDecoder().decode([NewsArticle].self, from: data)
                    self.newsArticles = decodedData
                } catch {
                    print("Failed to decode news articles: \(error)")
                }
            }
        }.resume()
    }
}


struct NewsView: View {
    @ObservedObject var viewModel: NewsViewModel
    let ticker: String
    @State private var showingDetail = false
    @State private var selectedArticle: NewsArticle?
    
    var body: some View {
        Text("News").font(.title)
        VStack {
            ScrollView {
                VStack {
                    if viewModel.isLoading {
                        ProgressView("Loading news...")
                    } else {
                        ForEach(Array(viewModel.newsArticles.enumerated()), id: \.element.id) { index, article in
                            NewsArticleRow(article: article, isFeatured: index == 0)
                                .onTapGesture {
                                    self.selectedArticle = article
                                    self.showingDetail = true
                                }.sheet(isPresented: $showingDetail) {
                                    
                                    NewsDetailSheetView(article: self.selectedArticle ?? article, isPresented: $showingDetail)
                                    
                                }
                            
                        }
                    }
                }
            }
        }
        
        .onAppear {
            if viewModel.newsArticles.isEmpty {
                viewModel.fetchNews(for: ticker)
            }
        }
    }
}
struct NewsDetailSheetView: View {
    let article: NewsArticle
    @Binding var isPresented: Bool
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 5) {
                        Text(article.source)
                            .font(.title)
                            .bold()
                            .padding(.horizontal)
                        Text(formatDate(article.datetime))
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .padding(.horizontal)
                        Divider() // Adding the divider
                    }
                    
                    VStack(alignment: .leading, spacing: 5) {
                        Text(article.headline)
                            .font(.title2)
                            .bold()
                            .padding(.horizontal)
                            .lineLimit(2)
                        Text(article.summary)
                            .padding(.horizontal)
                            .lineLimit(5)
                        
                        
                        HStack {
                            Text("For more details click")
                                .foregroundColor(.secondary)
                            
                            Button("here") {
                                openURL(URL(string: article.url)!)
                            }
                            .foregroundColor(.blue)
                        }
                        .padding(.horizontal)
                        
                        HStack {
                            shareButton("twitter", action: {
                                shareOnTwitter(article)
                            })
                            shareButton("facebook", action: {
                                shareOnFacebook(article)
                            })
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .navigationBarItems(trailing: Button(action: {
                self.isPresented = false
            }, label: {
                Text("X")
                    .bold()
                    .foregroundColor(.black)
            }))
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private func shareButton(_ imageName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(imageName)
                .resizable()
                .scaledToFit()
                .frame(width: 38, height: 38)
        }
    }
    
    private func formatDate(_ timestamp: TimeInterval) -> String {
        let date = Date(timeIntervalSince1970: timestamp)
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
    
    private func shareOnTwitter(_ article: NewsArticle) {
        let text = "\(article.headline) \(article.url)"
        let twitterURL = "https://twitter.com/intent/tweet?text=\(text)"
        openURL(URL(string: twitterURL)!)
    }
    
    private func shareOnFacebook(_ article: NewsArticle) {
        guard let urlEncoded = article.url.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "https://www.facebook.com/sharer/sharer.php?u=\(urlEncoded)") else {
            print("Invalid URL")
            return
        }
        openURL(url)
    }
    
    
    private func openURL(_ url: URL?) {
        guard let url = url, UIApplication.shared.canOpenURL(url) else { return }
        UIApplication.shared.open(url, options: [:]) { success in
            if !success {
                print("Failed to open URL: \(url.absoluteString)")
            }
        }
    }
}




struct NewsArticleRow: View {
    let article: NewsArticle
    var isFeatured: Bool
    
    var body: some View {
        VStack(alignment: .leading) {
            if isFeatured {
                fArticleView
            } else {
                rArticleView
            }
        }
        .padding(.vertical, isFeatured ? 10 : 2)
    }
    
    
    private var fArticleView: some View {
        VStack(alignment: .leading, spacing: 5) {
            AsyncImage(url: URL(string: article.image)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 250)
                        .clipped()
                case .failure(_):
                    placeholderImage
                case .empty:
                    ProgressView()
                @unknown default:
                    EmptyView()
                }
            }
            .cornerRadius(10)
            .padding(.horizontal)
            
            articleDetails
            Divider()
        }
    }
    
    
    private var rArticleView: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 3) {
                articleDetails
                
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            AsyncImage(url: URL(string: article.image)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 100, height: 100)
                        .clipped()
                case .failure(_):
                    placeholderImage
                case .empty:
                    ProgressView()
                @unknown default:
                    EmptyView()
                }
            }
            .cornerRadius(10)
        }
    }
    
    
    private var articleDetails: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack {
                Text(article.source)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text(article.timeAgo)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Text(article.headline)
                .font(.headline)
                .lineLimit(3)
        }
        .padding([.horizontal, .bottom])
    }
    
    
    private var placeholderImage: some View {
        Color.gray.frame(width: 100, height: 100)
    }
    
}





