import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;

  constructor() {
   }

  ngOnInit() {
  }

  login(): void {
    //TODO
    console.log(this.username);
    console.log(this.password);
  }
}
