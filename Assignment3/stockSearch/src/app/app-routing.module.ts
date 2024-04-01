import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SearchDetailsComponent } from './search-details/search-details.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';

const routes: Routes = [
  { 
    path: '', 
    component: MainLayoutComponent,
    children: [
    { path: '', redirectTo: '/search/home', pathMatch: 'full' },
    { path: 'search/home', component: HomeComponent },
    // { path: 'search/:ticker', component: SearchDetailsComponent },
    { path: 'search/:ticker', component: HomeComponent },
    { path: 'watchlist', component: WatchlistComponent },
    { path: 'portfolio', component: PortfolioComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
