import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { Deck } from './deck';
import { DECKS } from './mock-decks';

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  constructor(private messageService: MessageService) { }

  getDeck(id: number): Observable<Deck> {
    // TODO: send the message _after_ fetching the hero
    this.messageService.add(`DeckService: fetched deck id=${id}`);
    return of(DECKS.find(deck => deck.id === id));
  }

  getDecks(): Observable<Deck[]> {
    // TODO: send the message _after_ fetching the heroes
    this.messageService.add('DeckService: fetched decks');
    return of(DECKS);
  }

}
