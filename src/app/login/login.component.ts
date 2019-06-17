import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;

  constructor(private authenticationService: AuthenticationService) {
   }

  ngOnInit() {
  }

  login(): void {
    console.log("bungle");
    this.authenticationService.login(this.username, this.password);
  }
}
