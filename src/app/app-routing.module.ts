import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './_guard/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DecksComponent } from './decks/decks.component';
import { LoginComponent } from './login/login.component';
import { SealedComponent } from './sealed/sealed.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'singles', component: DecksComponent, canActivate: [authGuard] },
  { path: 'sealed', component: SealedComponent, canActivate: [authGuard] },
  // The nav has always said "Singles"; keep the old path working for existing bookmarks
  { path: 'decks', redirectTo: 'singles' },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'home', component: HomeComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
