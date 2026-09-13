import { DeckSnapshot } from './deckSnapshot'
import { Card } from './card'

export class Deck {
    id: number;
    name: string;
    format: string;
    sortOrder: number;
    cards: Array<Card>;
    deckSnapshots: Array<DeckSnapshot>;
    /*
     * The day each range's baseline card price was read, keyed by the range's day count. A date
     * later than the range asked for is one the price history does not reach back far enough to
     * cover. Repeated on every deck: it describes the response, not the deck.
     */
    baselineDates: { [days: string]: string };
  }