import { Format } from './format'

export class Deck {
    id: number;
    name: string;
    format: Format;
    value: number;
    cards = [];
  }