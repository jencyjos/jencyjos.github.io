// sell-modal.component.ts
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services//portfolio.service';
import { Stock } from '../../../../backend/models/stock.model';

@Component({
  selector: 'app-sell-modal',
  templateUrl: './sell-modal.component.html',
  styleUrls: ['./sell-modal.component.css']
})
export class SellModalComponent {
  @Input() stock!: Stock;
  quantity: number = 1;

  constructor(
    public activeModal: NgbActiveModal,
    private portfolioService: PortfolioService
  ) {}

  onSubmit() {
    this.portfolioService.sellStock(this.stock.ticker, this.quantity).subscribe({
      next: (result) => {
        // Handle the successful sell
        this.activeModal.close(result);
      },
      error: (error) => {
        // Handle the error case
        console.error('Error selling stock:', error);
      }
    });
  }
}
