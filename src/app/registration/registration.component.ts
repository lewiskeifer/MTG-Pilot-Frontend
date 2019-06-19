import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { MustMatch } from '../_helper/must-match.validator';
import { AlertService } from '../_service/alert.service';
import { AuthenticationService } from '../_service/authentication.service';
import {ErrorStateMatcher} from '@angular/material/core';


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
    passwordForm: ['', [Validators.required]],
    passwordConfirmForm: ['', [Validators.required]],
    emailForm: ['', [Validators.required, Validators.email]]
  }, { updateOn: 'change' });

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

  // // convenience getter for easy access to form fields
  // get f() { return this.registerForm; }

  // onSubmit(): void {

  //   this.submitted = true;

  //   // stop here if form is invalid
  //   if (this.registerForm.invalid) {
  //       return;
  //   }

  //   this.loading = true;
  //   this.authenticationService.register(this.registerForm.value)
  //       .pipe(first())
  //       .subscribe(
  //           data => {
  //               this.alertService.success('Registration successful', true);
  //               this.router.navigate(['/login']);
  //           },
  //           error => {
  //               this.alertService.error(error);
  //               this.loading = false;
  //           });
  // }
}
