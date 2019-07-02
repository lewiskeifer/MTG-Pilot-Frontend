import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Card } from '../_model/card';
import { Deck } from '../_model/deck';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  private decksUrl = 'https://mtgpilot.com:8080/manager/users';
  // private decksUrl = 'http://localhost:8080/manager/users';

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient, private messageService: MessageService) { }

  /** GET all versions */
  getVersions(): Observable<String[]> {
    const url = `${this.decksUrl}/sets`;
    return this.httpClient.get<String[]>(url).pipe(
      tap(_ => this.log(`fetched versions`)),
        catchError(this.handleError<String[]>(`getVersions`))
    );
  }

  /** GET versions by card name */
  getVersionsByCardName(cardName: string): Observable<String[]> {
    const url = `${this.decksUrl}/sets/${cardName}`;
    return this.httpClient.get<String[]>(url).pipe(
      tap(_ => this.log(`fetched versions`)),
        catchError(this.handleError<String[]>(`getVersions`))
    );
  }

  /** GET version by groupId */
  getVersion(groupId: number): Observable<String> {
    const url = `${this.decksUrl}/set/${groupId}`;
    return this.httpClient.get<String>(url).pipe(
      tap(_ => this.log(`fetched version`)),
        catchError(this.handleError<String>(`getVersion`))
    );
  }

  /** GET deck by id */
  getDeck(userId: number, deckId: number): Observable<Deck> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}`;
    return this.httpClient.get<Deck>(url).pipe(
      tap(_ => this.log(`fetched deck id=${deckId}`)),
        catchError(this.handleError<Deck>(`getDeck id=${deckId}`))
    );
  }

    /** GET decks */
  getDecks(userId: number): Observable<Deck[]> {
    const url = `${this.decksUrl}/${userId}/decks`;
    return this.httpClient.get<Deck[]>(url).pipe(
      tap(_ => this.log('fetched decks')),
        catchError(this.handleError<Deck[]>('getDecks', [])));
  }

  /** PUT: update the deck on the server */
  saveCard(userId: number, deckId: number, card: Card): Observable<Card> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}/cards`;
    return this.httpClient.put(url, card, this.httpOptions).pipe(
      tap((newCard: Card) => this.log(`updated card id=${card.id}`)),
        catchError(this.handleError<Card>('saveCard'))
    );
  }

  /** DELETE: delete the card from the server */
  deleteCard(userId: number, deckId: number, cardId: number): Observable<any> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}/cards/${cardId}`;
    return this.httpClient.delete(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted card id=${cardId}`)),
        catchError(this.handleError<number>('deleteCard'))
    );
  }

  /** PUT: update the deck on the server */
  saveDeck(userId: number, deck: Deck): Observable<any> {
    const url = `${this.decksUrl}/${userId}/decks`;
    return this.httpClient.put(url, deck, this.httpOptions).pipe(
      tap(_ => this.log(`updated deck id=${deck.id}`)),
        catchError(this.handleError<any>('saveDeck'))
    );
  }

  /** DELETE: delete the deck from the server */
  deleteDeck(userId: number, deckId: number): Observable<any> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}`;
    return this.httpClient.delete(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted deck id=${deckId}`)),
        catchError(this.handleError<number>('deleteDeck'))
    );
  }

  /** PUT: update the deck on the server */
  refreshDeck(userId: number, deckId: number): Observable<void> {
    const url = `${this.decksUrl}/${userId}/decks/${deckId}/refresh`;
    return this.httpClient.put(url, this.httpOptions).pipe(
      tap(_ => this.log(`updated deck id=${deckId}`)),
        catchError(this.handleError<any>('refreshDeck'))
    );
  }

  /** Log a DeckService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`DeckService: ${message}`);
  }

  /**
  * Handle Http operation that failed.
  * Let the app continue.
  * @param operation - name of the operation that failed
  * @param result - optional value to return as the observable result
  */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
