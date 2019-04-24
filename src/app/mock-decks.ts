import { Deck } from './deck';
import { Card } from './card';
import { Format } from './format';

export const CARDS: Card[] = [
  { id: 1, name: 'Arcbound Ravager', set: 'Darksteel' },
  { id: 2, name: 'Walking Ballista', set: 'Magic Origins' },
];

export const DECKS: Deck[] = [
  { id: 1, name: 'Affinity Legacy', format: Format.LEGACY, cards: CARDS },
  { id: 2, name: 'Affinity Modern', format: Format.MODERN, cards: CARDS },
  { id: 3, name: 'Mono Blue', format: Format.LEGACY, cards: CARDS },
  { id: 4, name: 'Jund', format: Format.MODERN, cards: CARDS },
  { id: 5, name: 'Esper', format: Format.CASUAL, cards: CARDS },
  { id: 6, name: 'Bant', format: Format.CASUAL, cards: CARDS },
];