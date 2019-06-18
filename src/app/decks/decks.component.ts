import { Component, OnInit } from '@angular/core';
import { User } from '../_model/user'
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../_service/authentication.service'

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss']
})
export class DecksComponent implements OnInit {

  currentUser: User;
  currentUserSubscription: Subscription;

  constructor(private authenticationService: AuthenticationService) {
      this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
          this.currentUser = user;
      });
  }

  ngOnInit() {}

}
