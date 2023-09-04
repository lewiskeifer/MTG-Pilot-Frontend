import { DeckSnapshot } from './deckSnapshot'
import { Sealed } from './sealed'

export class SealedCollection {
    id: number;
    name: string;
    sortOrder: number;
    sealed: Array<Sealed>;
    sealedCollectionSnapshots: Array<DeckSnapshot>;
  }