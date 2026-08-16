import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { MyErrorStateMatcher } from '../_helper/error-state-matcher';
import { Login } from '../_model/login';
import { AlertService } from '../_service/alert.service';
import { AuthenticationService } from '../_service/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {

  matcher = new MyErrorStateMatcher();

  loading = false;
  submitted = false;

  loginForm = this.formBuilder.group({
    usernameForm: ['', [Validators.required]],
    passwordForm: ['', [Validators.required]]});

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
  }

  onSubmit(): void {
    
    let login = new Login(this.loginForm.controls["usernameForm"].value, this.loginForm.controls["passwordForm"].value);

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService.login(login)
        .pipe(first())
        .subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: error => {
                this.alertService.error(error.error.message);
                this.loading = false;
            }
        });
  }
}
