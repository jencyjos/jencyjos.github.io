
import { Component, Input } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services/portfolio.service'; 
import { Stock } from '../../../../backend/models/stock.model';

@Component({
  selector: 'app-sell-modal',
  templateUrl: './sell-modal.component.html',
  styleUrls: ['./sell-modal.component.css']
})
export class SellModalComponent {
  @Input() stock!: Stock;
  quantity: number = 0;
  errorMessage: string = ''; 
  showAlert : boolean = false
  alertMessage: string = ""
  isSuccess: boolean = false
  userWallet: number = 0;
  sellable: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private portfolioService: PortfolioService,
    private renderer: Renderer2
  ) {
    this.portfolioService.getWalletBalance().subscribe({
      next: (walletResponse: { balance: number }) => {
        this.userWallet = walletResponse.balance;
      },
      error: (error: any) => {
        console.error('Failed to fetch user wallet', error);
      }
    });
  }

  onSubmit() {
    if (this.quantity > this.stock.shares) {
      this.errorMessage = "You cannot sell the stocks that you don't have!";
      return; 
    }

    this.portfolioService.sellStock(this.stock.ticker, this.quantity, this.stock.currentPrice).subscribe({
      next: (result: any) => { 
       
        // this.alertMessage = 'Sold successfully!';
        this.isSuccess = true
    
        // const alert = this.renderer.createElement('div');
        // alert.textContent = this.alertMessage;
        // alert.className = 'alert';
        // alert.classList.add(this.isSuccess ? 'green-alert' : 'red-alert');
        // this.renderer.insertBefore(document.body, alert, document.body.firstChild);

        setTimeout(() => {
          this.activeModal.close({success: true, stock: this.stock, quantity:this.quantity});
          
        }, 200);
        setTimeout(() => {
          
          this.alertMessage = ''; 
          this.isSuccess = false;
          this.renderer.removeChild(document.body, alert);   
        }, 3000);

        
       
      },
      error: (error: any) => { 

        console.error('Error selling stock:', error);
        this.errorMessage = 'Failed to sell stock. Please try again.';
      }
    });
  }

  canSell(): boolean {
    return this.quantity >= 1 && this.quantity <= this.stock.shares;
  }


  onQuantityChange(newQuantity: number): void {
    this.quantity = newQuantity;
    if(this.quantity > this.stock.shares || this.quantity < 1){
      this.sellable = true
    }
    else{
      this.sellable = false;
    }
  }


}


