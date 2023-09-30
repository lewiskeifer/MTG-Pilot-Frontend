import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sealed } from '../_model/sealed';
import { SealedCollection } from '../_model/sealedCollection';

@Injectable({
  providedIn: 'root'
})
export class SealedService {

  private decksUrl = 'https://mtgpilot.com:8080/sealed';
  //private decksUrl = 'http://localhost:8080/sealed';

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  /** GET deck by id */
  getDeck(userId: number, deckId: number): Observable<SealedCollection> {
    const url = `${this.decksUrl}/${userId}/collection/${deckId}`;
    return this.httpClient.get<SealedCollection>(url);
  }

  /** GET decks */
  getDecks(userId: number): Observable<SealedCollection[]> {
    const url = `${this.decksUrl}/${userId}`;
    return this.httpClient.get<SealedCollection[]>(url);
  }

  /** PUT: update the deck on the server */
  saveCard(userId: number, deckId: number, card: Sealed): Observable<Sealed> {
    const url = `${this.decksUrl}/${userId}/collection/${deckId}/sealed`;
    return this.httpClient.put<Sealed>(url, card, this.httpOptions);
  }

  /** DELETE: delete the card from the server */
  deleteCard(userId: number, deckId: number, cardId: number): Observable<any> {
    const url = `${this.decksUrl}/${userId}/collection/${deckId}/sealed/${cardId}`;
    return this.httpClient.delete(url, this.httpOptions);
  }

  /** PUT: update the deck on the server */
  saveDeck(userId: number, deck: SealedCollection): Observable<any> {
    const url = `${this.decksUrl}/${userId}`;
    return this.httpClient.put(url, deck, this.httpOptions);
  }

  /** DELETE: delete the deck from the server */
  deleteDeck(userId: number, deckId: number): Observable<any> {
    const url = `${this.decksUrl}/${userId}/collection/${deckId}`;
    return this.httpClient.delete(url, this.httpOptions);
  }

  /** PUT: update the deck on the server */
  refreshDeck(userId: number, deckId: number): Observable<void> {
    const url = `${this.decksUrl}/${userId}/collection/${deckId}/refresh`;
    return this.httpClient.put<void>(url, this.httpOptions);
  }

}
