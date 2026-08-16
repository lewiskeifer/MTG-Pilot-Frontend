import { Observable } from 'rxjs';

/**
 * The slice of DeckService / SealedService that DetailBaseComponent uses. Both
 * services already expose these methods with matching signatures, so either one
 * satisfies this interface without any change.
 */
export interface DetailService<TDeck, TCard> {
  getDeck(userId: number, deckId: number): Observable<TDeck>;
  getDecks(userId: number): Observable<TDeck[]>;
  saveCard(userId: number, deckId: number, card: TCard): Observable<TCard>;
  deleteCard(userId: number, deckId: number, cardId: number): Observable<any>;
  saveDeck(userId: number, deck: TDeck): Observable<any>;
  deleteDeck(userId: number, deckId: number): Observable<any>;
  refreshDeck(userId: number, deckId: number): Observable<void>;
}
