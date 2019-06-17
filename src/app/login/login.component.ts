import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';

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
    console.log("bungle");
    this.authenticationService.login(this.username, this.password);
    this.router.navigate(['/dashboard']);
  }
}
