import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../_service/alert.service';
import { AuthenticationService } from '../_service/authentication.service';
import { Login } from '../_model/login'

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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

    this.authenticationService.login(login).subscribe(user => 
      { 
        user.token === null ? this.router.navigate(['/login']) : this.router.navigate(['/dashboard']);
      });
  }
}
