import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StockService } from './services/stock.service';

@Component({
  selector: 'app-root',
  // standalone: true,
  // imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [StockService]
})
export class AppComponent {
  title = 'stockSearch';

  constructor(private state: StockService){

  }
}
