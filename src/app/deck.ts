import { DeckSnapshot } from './DeckSnapshot'
import { Card } from './card'

export class Deck {
    id: number;
    name: string;
    format: string;
    value: number;
    cards = [];
    deckSnapshots = Array(DeckSnapshot);
  }