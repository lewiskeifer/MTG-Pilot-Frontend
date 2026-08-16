import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { MustMatch } from '../_helper/must-match.validator';
import { MyErrorStateMatcher } from '../_helper/error-state-matcher';
import { User } from '../_model/user';
import { AlertService } from '../_service/alert.service';
import { AuthenticationService } from '../_service/authentication.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: false
})
export class RegistrationComponent implements OnInit {

  loading = false;
  submitted = false;

  matcher = new MyErrorStateMatcher();

  registerForm = this.formBuilder.group({
    usernameForm: ['', [Validators.required]],
    passwordForm: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmForm: ['', [Validators.required, Validators.minLength(6)]],
    emailForm: ['', [Validators.required, Validators.email]]
  }, {validators: MustMatch('passwordForm', 'passwordConfirmForm')});

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

  // convenience getter for easy access to form fields
  get f() { return this.registerForm; }

  onSubmit(): void {

    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    let user = new User(this.registerForm.controls["usernameForm"].value, 
                        this.registerForm.controls["passwordForm"].value, 
                        this.registerForm.controls["emailForm"].value);
    this.loading = true;
    this.authenticationService.register(user)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Registration successful', true);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1200);
        },
        error: error => {
          this.alertService.error(error.error.message);
          this.loading = false;
        }
      });
  }
}
