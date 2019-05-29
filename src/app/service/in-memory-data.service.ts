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
      { id: 10, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near-mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 11, name: 'Walking Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near-mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 12, name: 'Ravager Ravager', version: 'Darksteel', isFoil: true, cardCondition: "Near-mint", purchasePrice: 120, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 13, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near-mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 14, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Light-play", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 15, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near-mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
    ];

    const cards2 = [
      { id: 16, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near-mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 17, name: 'Walking Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near-mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 18, name: 'Ravager Ravager', version: 'Darksteel', isFoil: true, cardCondition: "Near-mint", purchasePrice: 120, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 19, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near-mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 20, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Light-play", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
      { id: 21, name: 'Arcbound Ravager', version: 'Darksteel', isFoil: false, cardCondition: "Near-mint", purchasePrice: 40, marketPrice: 10, quantity: 4, url: "assets/img/0-0.jpg" },
    ];
    
     const decks = [
      { id: 0, name: 'Affinity Legacy', format: "Legacy", value: 10, cards: cards, deckSnapshots: deckSnapshots },
      { id: 1, name: 'Affinity Modern', format: "Legacy", value: 10, cards: cards2, deckSnapshots: deckSnapshots },
      { id: 2, name: 'Mono Blue', format: "Legacy", value: 10, cards: cards2, deckSnapshots: deckSnapshots2 },
      { id: 3, name: 'Jund', format: "Legacy", value: 10, cards: cards, deckSnapshots: deckSnapshots3 },
      { id: 4, name: 'Esper', format: "Legacy", value: 10, cards: cards, deckSnapshots: deckSnapshots4 },
      { id: 5, name: 'Bant', format: "Legacy", value: 10, cards: cards, deckSnapshots: deckSnapshots5 },
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
