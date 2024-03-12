import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms'; //To use two-way data binding with [(ngModel)] for form inputs
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; //navbar
import { HttpClientModule } from '@angular/common/http';

import { HomeComponent } from './home/home.component';
import { SearchDetailsComponent } from './search-details/search-details.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchDetailsComponent,
    WatchlistComponent,
    PortfolioComponent
    // list all your components here
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, // make sure AppRoutingModule is listed in imports
    FormsModule,              
    NgbModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

