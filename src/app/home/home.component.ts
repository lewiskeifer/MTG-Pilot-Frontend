import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  items = [
    { title: 'assets/img/logo.png' },
    { title: 'assets/img/1.PNG' },
    { title: 'assets/img/2.PNG' },
  ]

  constructor() { }

  ngOnInit() {
  }

}
