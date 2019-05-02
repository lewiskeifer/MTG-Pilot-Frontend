import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DecksComponent } from './decks/decks.component';
import { DeckDetailComponent }  from './deck-detail/deck-detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: DeckDetailComponent },
  { path: 'decks', component: DecksComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}