import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { MustMatch } from '../_helper/must-match.validator';
import { User } from '../_model/user';
import { AlertService } from '../_service/alert.service';
import { AuthenticationService } from '../_service/authentication.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
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
  }, {validator: MustMatch('passwordForm', 'passwordConfirmForm')});

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

    console.log("bung");
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }

    let user = new User(this.registerForm.controls["usernameForm"].value, 
                        this.registerForm.controls["passwordForm"].value, 
                        this.registerForm.controls["emailForm"].value);
    this.loading = true;
    this.authenticationService.register(user)
        .pipe(first())
        .subscribe(
            data => {
                this.alertService.success('Registration successful', true);
                this.router.navigate(['/login']);
            },
            error => {
                this.alertService.error(error);
                this.loading = false;
            });
  }
}
