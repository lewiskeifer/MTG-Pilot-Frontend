import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../_model/user';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  username: string;
  password: string;
  confirmPassword: string;
  email: string;

  constructor(private authenticationService: AuthenticationService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

  register(): void {
    let user = new User(this.username, this.password, this.email);
    this.authenticationService.register(user);
    this.router.navigate(['/login']);
  }

}
