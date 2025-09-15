import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  items = [
    { title: 'assets/img/mtgp1.PNG' },
    { title: 'assets/img/mtgp2.PNG' },
    { title: 'assets/img/mtgp3.PNG' },
  ]

  constructor() { }

  ngOnInit() {
  }

}
