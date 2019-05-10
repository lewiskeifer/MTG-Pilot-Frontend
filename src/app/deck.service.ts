import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { Deck } from './deck';
import { Card } from './card';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  private decksUrl = 'http://localhost:8080/manager/decks';  // URL to web api

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private httpClient: HttpClient, private messageService: MessageService) { }

  /** GET deck by id. Will 404 if id not found */
  getDeck(id: number): Observable<Deck> {
    const url = `${this.decksUrl}/${id}`;
    return this.httpClient.get<Deck>(url).pipe(
      tap(_ => this.log(`fetched deck id=${id}`))
        ,catchError(this.handleError<Deck>(`getDeck id=${id}`))
    );
  }

  getDecks(): Observable<Deck[]> {
    return this.httpClient.get<Deck[]>(this.decksUrl)
      .pipe(tap(_ => this.log('fetched decks'))
        ,catchError(this.handleError<Deck[]>('getDecks', [])));
  }

  /* GET decks whose name contains search term */
  searchDecks(term: string): Observable<Deck[]> {
    if (!term.trim()) {
      // if not search term, return empty deck array.
      return of([]);
    }
    return this.httpClient.get<Deck[]>(`${this.decksUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found decks matching "${term}"`)),
        catchError(this.handleError<Deck[]>('searchDecks', []))
    );
  }

  /** POST: add a new deck to the server */
  addDeck (deck: Deck): Observable<Deck> {
    return this.httpClient.post<Deck>(this.decksUrl, deck, this.httpOptions).pipe(
      tap((newDeck: Deck) => this.log(`added deck w/ id=${newDeck.id}`)),
        catchError(this.handleError<Deck>('addDeck'))
    );
  }

  /** PUT: update the deck on the server */
  addCardToDeck (card: Card, id: number): Observable<any> {
    const url = `${this.decksUrl}/${id}`;
    return this.httpClient.put(url, card, this.httpOptions).pipe(
      tap(_ => this.log(`updated deck id=${id}`)),
        catchError(this.handleError<any>('addCardToDeck'))
    );
  }

  /** DELETE: delete the deck from the server */
  deleteDeck (deck: Deck | number): Observable<Deck> {
    const id = typeof deck === 'number' ? deck : deck.id;
    const url = `${this.decksUrl}/${id}`;

    return this.httpClient.delete<Deck>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted deck id=${id}`)),
        catchError(this.handleError<Deck>('deleteDeck'))
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
