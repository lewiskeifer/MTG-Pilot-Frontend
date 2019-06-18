import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DeckService } from '../_service/deck.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../_service/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(private authenticationService: AuthenticationService, 
              private route: ActivatedRoute, 
              private router: Router, 
              private alertService: AlertService,
              private formBuilder: FormBuilder) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) { 
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.authenticationService.login(this.loginForm.value).subscribe(user => 
      { 
        user.token === null ? this.router.navigate(['/login']) : this.router.navigate(['/dashboard']);
      });
  }
}
