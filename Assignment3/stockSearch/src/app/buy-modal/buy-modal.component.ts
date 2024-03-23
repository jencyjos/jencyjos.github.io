import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PortfolioService } from '../services/portfolio.service';
import { Stock } from '../../../../backend/models/stock.model';

@Component({
  selector: 'buy-modal',
  templateUrl: './buy-modal.component.html',
  styleUrls: ['./buy-modal.component.css']
})
export class BuyModalComponent {
  @Input() stock: Stock;
  quantity: number;


  constructor(
    public activeModal: NgbActiveModal,
    private portfolioService: PortfolioService
  ) {}

  onSubmit() {
    this.portfolioService.buyStock(this.stock.ticker, this.quantity).subscribe({
      next: (result) => {
        // Handle successful buy
        // Maybe refresh the portfolio or emit an event
        this.activeModal.close(result);
      },
      error: (error) => {
        // Handle error
        console.error('Error buying stock', error);
      }
    });
  }
}