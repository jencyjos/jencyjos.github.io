import Foundation
import SwiftUI

struct SuccessMessageView: View {
    var message: String
    var onDismiss: () -> Void
    
    var body: some View {
        ZStack {
            Color.green.edgesIgnoringSafeArea(.all)
            VStack {
                Spacer()
                
                Text("Congratulations!")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text(message)
                    .foregroundColor(.white)
                    .padding()
                
                Spacer()
                
                Button("Done") {
                    onDismiss()
                }
                .padding()
                .frame(maxWidth: 340)
                .background(Color.white)
                .foregroundColor(Color.green)
                .cornerRadius(25)
            }
        }
    }
}

struct SuccessMessageView_Previews: PreviewProvider {
    static var previews: some View {
        SuccessMessageView(message: "You have successfully completed your task.", onDismiss: {})
    }
}
