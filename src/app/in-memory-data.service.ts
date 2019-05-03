import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Deck } from './deck';
import { Card } from './card';
import { Format } from './format';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
     const cards = [
      { id: 0, name: 'Arcbound Ravager', set: 'Darksteel', value: 40 },
      { id: 1, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 2, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 3, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 4, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 5, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 6, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 7, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 8, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 9, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 10, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
    ];

    const cards2 = [
      { id: 0, name: 'Arcbound Ravager', set: 'Darksteel', value: 40 },
      { id: 1, name: 'Walking Ravager', set: 'Magic Origins', value: 10 },
      { id: 2, name: 'Walking Ravager', set: 'Magic Origins', value: 10 },
      { id: 3, name: 'Walking Ravager', set: 'Magic Origins', value: 10 },
      { id: 4, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 5, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 6, name: 'Walking Ravager', set: 'Magic Origins', value: 10 },
      { id: 7, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 8, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 9, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
      { id: 10, name: 'Walking Ballista', set: 'Magic Origins', value: 10 },
    ];
    
     const decks = [
      { id: 0, name: 'Affinity Legacy', format: Format.LEGACY, value: 10, cards: cards },
      { id: 1, name: 'Affinity Modern', format: Format.MODERN, value: 10, cards: cards2 },
      { id: 2, name: 'Mono Blue', format: Format.LEGACY, value: 10, cards: cards2 },
      { id: 3, name: 'Jund', format: Format.MODERN, value: 10, cards: cards },
      { id: 4, name: 'Esper', format: Format.CASUAL, value: 10, cards: cards },
      { id: 5, name: 'Bant', format: Format.CASUAL, value: 10, cards: cards },
    ];
    return {decks};
  }

  // Overrides the genId method to ensure that a deck always has an id.
  // If the decks array is empty,
  // the method below returns the initial number (7).
  // if the decks array is not empty, the method below returns the highest
  // deck id + 1.
  genId(decks: Deck[]): number {
    return decks.length > 0 ? Math.max(...decks.map(deck => deck.id)) + 1 : 7;
  }
}
