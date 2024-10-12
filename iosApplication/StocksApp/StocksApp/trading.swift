import Foundation
import SwiftUI
import Alamofire

struct TradeSheetView: View {
    
    @Binding var isPresented: Bool
    var stock: Stock?
    var sharePrice: Double
    var name: String
    var ticker: String
    
    @State var numberOfSharesText: String = "0"
    @State var tradeMessage: String?
    @State var showTradeMessage: Bool = false
    @State var tradeSuccessful: Bool = false
    @State private var showingToast: Bool = false
    @State private var autoDismissTimer: Timer?
    @State private var showSuccessMessage = false
    @State private var successMessage = ""
    @State private var isTradeSheetPresented = false
    @StateObject private var portfolioViewModel = PortfolioViewModel()
    
    
    @State var availableBalance: Double = 0
    
    private var totalCost: Double {
        (Double(numberOfSharesText) ?? 0) * sharePrice
    }
    
    private var numberOfShares: Int? {
        Int(numberOfSharesText)
    }
    
    private var isInputValid: Bool {
        if let numberOfShares = numberOfShares, numberOfShares > 0 {
            return true
        }
        return false
    }
    
    var body: some View {
        NavigationView{
            VStack {
                Text("Trade \(name) shares")
                    .font(.headline)
                    .padding()
                
                Spacer()
                
                HStack {
                    TextField("", text: $numberOfSharesText)
                        .keyboardType(.numberPad)
                        .font(.system(size: 130))
                        .padding()
                    
                    
                    VStack{
                        Text("\(numberOfShares ?? 0 > 1 ? "Shares" : "Share")")
                            .font(.title)
                            .padding()
                        Text("x \(sharePrice, specifier: "%.2f")/share = \(totalCost, specifier: "%.2f")")
                        
                        
                        
                    }
                }
                
                .padding()
                
                Spacer()
                
                Text("$\(availableBalance, specifier: "%.2f") available to buy \(ticker)")
                    .foregroundColor(.secondary)
                
                HStack(spacing: 20) {
                    Button("Buy", action: {
                        executeTrade(isBuy: true)
                        
                    })
                    .buttonStyle(TradeButtonStyle())
                    
                    Button("Sell", action: {
                        executeTrade(isBuy: false)
                    })
                    .buttonStyle(TradeButtonStyle())
                }
                .padding(.bottom, 20)
            }
            
            .onAppear(perform:{
                fetchWalletBalance()})
            
            .overlay(
                toastView
                    .padding(.bottom, 50)
                    .opacity(showingToast ? 1 : 0),
                alignment: .bottom
            )
            .onChange(of: showingToast) { newValue in
                if newValue {
                    startAutoDismissTimer()
                }
            }
            .fullScreenCover(isPresented: $showSuccessMessage) {
                SuccessMessageView(message: successMessage) {
                    showSuccessMessage = false
                }
            }
            .navigationBarItems(trailing: Button(action: {
                isPresented = false
            }) {
                Image(systemName: "xmark")
                    .foregroundColor(.black)
                    .padding()
            })
            Button("Present Trade Sheet") {
                isPresented.toggle()
            }
            .padding()
            .sheet(isPresented: $isPresented) {
                TradeSheetView(isPresented: $isPresented, stock: nil, sharePrice: 175, name: "AAPL", ticker: "AAPL")
            }
        }
        
        
    }
    private var toastView: some View {
        ToastView(message: tradeMessage ?? "")
            .onTapGesture {
                withAnimation {
                    showingToast = false
                }
            }
    }
    
    private func startAutoDismissTimer() {
        autoDismissTimer?.invalidate()
        autoDismissTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { _ in
            withAnimation {
                showingToast = false
            }
        }
    }
    
    func fetchWalletBalance() {
        let url: String = "https://assignment-3-419020.wl.r.appspot.comapi/wallet"
        
        AF.request(url).responseDecodable(of: Wallet.self) { response in
            switch response.result {
            case .success(let data):
                self.availableBalance = data.balance
            case .failure(let error):
                print(error)
            }
        }
        
        
    }
    
    
    func Buy(t:purchase,completion: @escaping () -> Void) {
        let url: String = "https://assignment-3-419020.wl.r.appspot.com/api/buy"
        
        AF.request(url, method: .post, parameters: t, encoder: JSONParameterEncoder.default).response { response in
            DispatchQueue.main.async {
                switch response.result {
                case .success(_):
                    print(response.response as Any)
                    print(t)
                    completion()
                case .failure(let error):
                    print("Failed to sync portfolio: \(error.localizedDescription)")
                }
            }
        }
        
        
        
    }
    
    
    func Sell(t:purchase) {
        let url: String = "https://assignment-3-419020.wl.r.appspot.com/api/sell"
        
        AF.request(url, method: .post, parameters: t, encoder: JSONParameterEncoder.default).response { response in
            DispatchQueue.main.async {
                switch response.result {
                case .success(_):
                    print(response.response as Any)
                    print(t)
                case .failure(let error):
                    print("Failed to sync portfolio: \(error.localizedDescription)")
                }
            }
        }
        
        
        
    }
    
    
    func executeTrade(isBuy: Bool) {
        
        guard let numberOfShares = Int(numberOfSharesText), numberOfShares > 0 else {
            tradeMessage = "Please enter a valid amount"
            withAnimation {
                showingToast = true
            }
            return
        }
        
        if isBuy {
            if totalCost > availableBalance {
                tradeMessage = "Not enough money to buy"
            } else {
                let purchas = purchase(ticker: self.ticker, quantity: numberOfShares, price:sharePrice, name: name )
                print(purchas)
                Buy(t:purchas){
                    
                    
                    portfolioViewModel.fetchPortfolio(for: ticker){pf in
                        
                        portfolioViewModel.stock=pf
                        
                        
                    }
                }
                successMessage = "You have successfully bought \(numberOfSharesText) shares of \(ticker)"
                showSuccessMessage = true
            }
        } else {
            let ownedShares = 7
            if numberOfShares > ownedShares {
                tradeMessage = "Not enough shares to sell"
            } else {
                let purchas = purchase(ticker: self.ticker, quantity: numberOfShares, price:sharePrice)
                print(purchas)
                Sell(t:purchas)
                successMessage = "You have successfully sold \(numberOfSharesText) shares of \(ticker)"
                showSuccessMessage = true
            }
        }
        
        withAnimation {
            showingToast = true
        }
        if tradeSuccessful {
            showingToast = false
            showSuccessMessage = true
        }
        
    }
    
}


struct ToastView: View {
    let message: String
    
    var body: some View {
        Text(message)
            .bold()
            .foregroundColor(.white)
            .padding()
            .background(Color.black)
            .cornerRadius(20)
            .shadow(radius: 5)
            .frame(maxWidth: .infinity)
    }
}


struct TradeButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .frame(maxWidth: 180)
            .background(Color.green)
            .foregroundColor(.white)
            .cornerRadius(25)
    }
}

struct TradeSheetView_Previews: PreviewProvider {
    static var previews: some View {
        TradeSheetView(isPresented: .constant(true), stock: nil, sharePrice:175, name: "AAPL", ticker: "AAPL")
    }
}


struct purchase: Encodable{
    var ticker: String
    var quantity: Int
    var price: Double
    var name: String?
}








