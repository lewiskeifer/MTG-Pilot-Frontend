import { DeckSnapshot } from './deckSnapshot'
import { Sealed } from './sealed'

export class SealedCollection {
    id: number;
    name: string;
    sortOrder: number;
    sealed: Array<Sealed>;
    sealedCollectionSnapshots: Array<DeckSnapshot>;
    /** As on a deck: the day each range's baseline product price was read. */
    baselineDates: { [days: string]: string };
  }