import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services/portfolio.service';
import { Stock } from '../../../../backend/models/stock.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'buy-modal',
  templateUrl: './buy-modal.component.html',
  styleUrls: ['./buy-modal.component.css']
})
export class BuyModalComponent implements OnInit {
  @Input() stock!: Stock;
  private _quantity: number = 1;
  userWallet!: number; 
  totalPrice: number = 0;
  quantityChanged : boolean = false;
  showAlert : boolean = false
  alertMessage: string = ""
  isSuccess = false

  constructor(
    public activeModal: NgbActiveModal,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    this.fetchUserWallet();
  }

  fetchUserWallet() {
    this.portfolioService.getWalletBalance().subscribe({
      next: (walletResponse: { balance: number }) => {
        this.userWallet = walletResponse.balance;
      },
      error: (error: any) => {
        console.error('Failed to fetch user wallet', error);
      }
    });
  }
  quantity: number = 0;

  onQuantityChange(newQuantity: number): void {
    this.quantity = newQuantity;
    this.totalPrice = this.calculateTotalPrice(newQuantity);
    this.quantityChanged = true
  }

  calculateTotalPrice(quantity: number): number {
    console.log(typeof this.stock.currentPrice);
    return this.stock.currentPrice * quantity;
  }

  canBuy(): boolean {
    console.log('Checking canBuy:', this.totalPrice, this.userWallet, this.quantity);
    return (this.totalPrice <= this.userWallet) && this.quantity >=1 ;
  }

  onSubmit() {
    if (this.canBuy()) {
      console.log('we can buy this!')
      this.portfolioService.buyStock(this.stock.ticker, this.stock.name, this.quantity, this.stock.currentPrice).subscribe({
        next: (result: any) => { 
          this.userWallet -= this.totalPrice;
          this.activeModal.close({success: true, stock: this.stock, quantity:this.quantity, totalCost: this.totalPrice});
          // this.alertMessage = 'Stock bought successfully!';
          this.isSuccess = true
          this.showAlert = true; 
          setTimeout(() => { this.showAlert = false; }, 25000); 
        },
        error: (error: any) => {
          console.error('Error buying stock', error);
          // this.alertMessage = 'Failed to buy stock!';
          this.showAlert = true; 
          setTimeout(() => { this.showAlert = false; }, 5000); 
        }
      });
    } else {
      alert("You can't afford this purchase.");
    }
  }
}
