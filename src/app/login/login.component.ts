import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DeckService } from '../_service/deck.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;

  constructor(private authenticationService: AuthenticationService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

  login(): void {
    this.authenticationService.login(this.username, this.password).subscribe(user => 
      { 
        user.token === null ? this.router.navigate(['/login']) : this.router.navigate(['/dashboard']);
      });
  }
}
