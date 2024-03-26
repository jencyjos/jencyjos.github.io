import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services/portfolio.service';
import { Stock } from '../../../../backend/models/stock.model';

@Component({
  selector: 'buy-modal',
  templateUrl: './buy-modal.component.html',
  styleUrls: ['./buy-modal.component.css']
})
export class BuyModalComponent implements OnInit {
  @Input() stock!: Stock;
  private _quantity: number = 1;
  userWallet!: number; // This will now be fetched dynamically
  totalPrice: number = 0;

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

  get quantity(): number {
    return this._quantity;
  }

  set quantity(value: number) {
    this._quantity = value;
    this.totalPrice = this.calculateTotalPrice(value);
  }

  calculateTotalPrice(quantity: number): number {
    return this.stock.currentPrice * quantity;
  }

  canBuy(): boolean {
    return this.totalPrice <= this.userWallet && this.quantity > 0;
  }

  onSubmit() {
    if (this.canBuy()) {
      this.portfolioService.buyStock(this.stock.ticker, this.quantity).subscribe({
        next: (result: any) => { // Consider using a specific type instead of any if possible
          // Update the user wallet after a successful transaction
          this.userWallet -= this.totalPrice;
          this.activeModal.close(result);
        },
        error: (error: any) => {
          console.error('Error buying stock', error);
        }
      });
    } else {
      alert("You can't afford this purchase.");
    }
  }
}
