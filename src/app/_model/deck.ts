import { DeckSnapshot } from './deckSnapshot'
import { Card } from './card'

export class Deck {
    id: number;
    name: string;
    format: string;
    sortOrder: number;
    cards: Array<Card>;
    deckSnapshots: Array<DeckSnapshot>;
  }