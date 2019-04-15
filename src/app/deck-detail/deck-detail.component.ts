import { Component, OnInit, Input } from '@angular/core';
import { Deck } from '../deck';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { DeckService }  from '../deck.service';

@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss']
})
export class DeckDetailComponent implements OnInit {

  @Input() deck: Deck;

  constructor(
    private route: ActivatedRoute,
    private deckService: DeckService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.getDeck();
  }

  getDeck(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.deckService.getDeck(id)
      .subscribe(deck => this.deck = deck);
  }

  goBack(): void {
    this.location.back();
  }

}
