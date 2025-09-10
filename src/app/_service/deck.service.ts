import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Card } from '../_model/card';
import { Deck } from '../_model/deck';

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  private decksUrl = 'https://mtgpilot.com:8443/manager/users';
  //private decksUrl = 'http://localhost:8080/manager/users';

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient) { }

  /** GET all versions */
  getVersions(): Observable<String[]> {
    const url = `${this.decksUrl}/sets`;
    return this.httpClient.get<String[]>(url);
  }

  /** GET versions by card name */
  getVersionsByCardName(cardName: string): Observable<String[]> {
    const url = `${this.decksUrl}/sets/${cardName}`;
    return this.httpClient.get<String[]>(url);
  }

  /** GET version by groupId */
  getVersion(groupId: number): Observable<String> {
    const url = `${this.decksUrl}/set/${groupId}`;
    return this.httpClient.get<String>(url);
  }

  /** GET deck by id */
  getDeck(userId: number, deckId: number): Observable<Deck> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}`;
    return this.httpClient.get<Deck>(url);
  }

    /** GET decks */
  getDecks(userId: number): Observable<Deck[]> {
    const url = `${this.decksUrl}/${userId}/decks`;
    return this.httpClient.get<Deck[]>(url);
  }

  /** PUT: update the deck on the server */
  saveCard(userId: number, deckId: number, card: Card): Observable<Card> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}/cards`;
    return this.httpClient.put<Card>(url, card, this.httpOptions);
  }

  /** DELETE: delete the card from the server */
  deleteCard(userId: number, deckId: number, cardId: number): Observable<any> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}/cards/${cardId}`;
    return this.httpClient.delete(url, this.httpOptions);
  }

  /** PUT: update the deck on the server */
  saveDeck(userId: number, deck: Deck): Observable<any> {
    const url = `${this.decksUrl}/${userId}/decks`;
    return this.httpClient.put(url, deck, this.httpOptions);
  }

  /** DELETE: delete the deck from the server */
  deleteDeck(userId: number, deckId: number): Observable<any> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}`;
    return this.httpClient.delete(url, this.httpOptions);
  }

  /** PUT: update the deck on the server */
  refreshDeck(userId: number, deckId: number): Observable<void> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}/refresh`;
    return this.httpClient.put<void>(url, this.httpOptions);
  }

}
