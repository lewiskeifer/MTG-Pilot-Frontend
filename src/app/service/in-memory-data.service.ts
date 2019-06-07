import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Deck } from '../model/deck';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const deckSnapshots = [
      {value: 100, timestamp:"1/1/19"},
      {value: 95, timestamp:"2/1/19"},
      {value: 130, timestamp:"3/1/19"},
    ];
    const deckSnapshots2 = [
      {value: 50, timestamp:"1/1/19"},
      {value: 95, timestamp:"2/1/19"},
      {value: 150, timestamp:"3/1/19"},
    ];
    const deckSnapshots3 = [
      {value: 10, timestamp:"1/1/19"},
      {value: 25, timestamp:"2/1/19"},
      {value: 30, timestamp:"3/1/19"},
    ];
    const deckSnapshots4 = [
      {value: 80, timestamp:"1/1/19"},
      {value: 160, timestamp:"2/1/19"},
      {value: 240, timestamp:"3/1/19"},
    ];
    const deckSnapshots5 = [
      {value: 50, timestamp:"1/1/19"},
      {value: 55, timestamp:"2/1/19"},
      {value: 69, timestamp:"3/1/19"},
    ];
     const cards = [
      { id: 10, name: 'Affinity Modern', marketPrice: 10, quantity: 1, url: "assets/img/0-0.jpg" },
      { id: 11, name: 'Mono Blue', marketPrice: 10, quantity: 1, url: "assets/img/0-0.jpg" },
      { id: 12, name: 'Junder', marketPrice: 20, quantity: 1, url: "assets/img/0-0.jpg" },
      { id: 13, name: 'Esper', marketPrice: 5, quantity: 1, url: "assets/img/0-0.jpg" },
      { id: 14, name: 'Bant', marketPrice: 10, quantity: 1, url: "assets/img/0-0.jpg" },
    ];

    const cards2 = [
      { id: 10, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Damaged", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 11, name: 'Walking Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near Mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 12, name: 'Ravager Ravager', version: 'Darksteel', isFoil: true, cardCondition: "Near Mint", purchasePrice: 10, marketPrice: 30, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 13, name: 'Arcbound Arcbound', version: 'Darksteel', isFoil: false, cardCondition: "Near Mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 14, name: 'Arcbound Walker', version: 'Darksteel', isFoil: false, cardCondition: "Lightly Played", purchasePrice: 40, marketPrice: 8, quantity: 3, url: "assets/img/0-0.jpg" },
    ];
    
     const decks = [
      { id: 0, name: 'Deck Overview', format: "Legacy", value: 50, cards: cards, deckSnapshots: deckSnapshots },
      { id: 1, name: 'Affinity Modern', format: "Legacy", value: 10, cards: cards2, deckSnapshots: deckSnapshots },
      { id: 2, name: 'Mono Blue', format: "Legacy", value: 10, cards: cards2, deckSnapshots: deckSnapshots2 },
      { id: 3, name: 'Jund', format: "Legacy", value: 10, cards: cards2, deckSnapshots: deckSnapshots3 },
      { id: 4, name: 'Esper', format: "Legacy", value: 10, cards: cards2, deckSnapshots: deckSnapshots4 },
      { id: 5, name: 'Bant', format: "Legacy", value: 10, cards: cards2, deckSnapshots: deckSnapshots5 },
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
