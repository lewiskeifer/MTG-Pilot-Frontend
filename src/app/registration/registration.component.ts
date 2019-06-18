import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../_model/user';
import { AlertService } from '../_service/alert.service';
import { AuthenticationService } from '../_service/authentication.service';
import { first } from 'rxjs/operators';
import { MustMatch } from '../_helper/must-match.validator';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  registerForm: FormGroup;
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
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {validator: MustMatch('password', 'confirmPassword')});
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit(): void {

    console.log(0);

    this.submitted = true;

    console.log(1);

    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }

    console.log(2);

    this.loading = true;
    this.authenticationService.register(this.registerForm.value)
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

    console.log(3);
  }
}
