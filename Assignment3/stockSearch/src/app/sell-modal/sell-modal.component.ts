// sell-modal.component.ts
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services/portfolio.service'; // Removed the extra slash
import { Stock } from '../../../../backend/models/stock.model';

@Component({
  selector: 'app-sell-modal',
  templateUrl: './sell-modal.component.html',
  styleUrls: ['./sell-modal.component.css']
})
export class SellModalComponent {
  @Input() stock!: Stock;
  quantity: number = 1;
  errorMessage: string = ''; // Added for displaying error messages in the modal

  constructor(
    public activeModal: NgbActiveModal,
    private portfolioService: PortfolioService
  ) {}

  onSubmit() {
    if (this.quantity > this.stock.shares) {
      this.errorMessage = "You can't sell more shares than you own.";
      return; // Prevents the sell operation if quantity is invalid
    }

    this.portfolioService.sellStock(this.stock.ticker, this.quantity).subscribe({
      next: (result: any) => { // Consider using a specific type for `result`
        // Handle the successful sell
        this.activeModal.close(result);
      },
      error: (error: any) => { // Consider using a specific type for `error`
        // Handle the error case
        console.error('Error selling stock:', error);
        this.errorMessage = 'Failed to sell stock. Please try again.';
      }
    });
  }
  canSell(): boolean {
    return this.quantity >= 1 && this.quantity <= this.stock.shares;
  }
}
