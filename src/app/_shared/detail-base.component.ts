import { Directive, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { finalize, first, switchMap, tap } from 'rxjs/operators';
import { MyErrorStateMatcher } from '../_helper/error-state-matcher';
import { NonZero } from '../_helper/non-zero.validator';
import { User } from '../_model/user';
import { AlertService } from '../_service/alert.service';
import { DetailService } from './detail-service';

/** The fields this base class needs from a Deck / SealedCollection. */
export interface DetailDeck {
  id: number;
  name: string;
  sortOrder: number;
}

/** The fields this base class needs from a Card / Sealed. */
export interface DetailCard {
  id: number;
  quantity: number;
  purchasePrice: number;
  marketPrice: number;
}

/**
 * Shared behaviour for the deck (singles) and sealed detail screens.
 *
 * The two screens differ only in the model field holding their items
 * (Deck.cards vs SealedCollection.sealed), the extra attributes a single carries
 * (condition / foil / set, plus the deck's format) and a couple of alert
 * strings. Those are the abstract members and the protected hooks below;
 * everything else lives here once.
 */
@Directive()
export abstract class DetailBaseComponent<TDeck extends DetailDeck, TCard extends DetailCard> implements OnInit {

  currentUser: User;

  searchText: string = "";
  versions: any[];

  dataSource: MatTableDataSource<TCard>;
  displayedColumnsDecks: string[] = ['card', 'totalPurchasePrice', 'totalValue'];

  decks: TDeck[];

  emptyDeck: TDeck;
  selectedDeck: TDeck;

  emptyCard: TCard;
  selectedCard: TCard;

  loading: boolean;
  loadingCard: boolean;
  loadingDeck: boolean;

  decksForm: FormGroup;
  decksOptions = [];

  ordersForm: FormGroup;
  ordersOptions = [];

  versionsForm: FormGroup;
  versionsOptions = [];

  matcher = new MyErrorStateMatcher();

  cardForm: FormGroup;

  /** Columns of the item table; sealed products have no condition or set. */
  abstract displayedColumns: string[];

  /** Built by the subclass because the deck form carries an extra format control. */
  abstract deckForm: FormGroup;

  /** Fallback shown when saving an item fails. */
  protected abstract saveCardErrorMessage: string;

  /** Shown when a save succeeds but comes back with no item. */
  protected abstract missingCardMessage: string;

  /** Alert shown after a deck save succeeds. */
  protected abstract deckSavedMessage(isNew: boolean): string;

  constructor(protected alertService: AlertService,
              protected service: DetailService<TDeck, TCard>,
              protected formBuilder: FormBuilder) {

    this.cardForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
      purchasePrice: ['', [Validators.required]]
    }, {validators: [NonZero('quantity'), NonZero('purchasePrice')]});

    this.decksForm = this.formBuilder.group({
      decksOptions: ['']
    });

    this.ordersForm = this.formBuilder.group({
      ordersOptions: ['']
    });

    this.versionsForm = this.formBuilder.group({
      versionsOptions: ['']
    });
  }

  /** The concrete model the subclass works with. */
  protected abstract createEmptyDeck(): TDeck;
  protected abstract createEmptyCard(): TCard;

  /** Deck.cards or SealedCollection.sealed. */
  protected abstract itemsOf(deck: TDeck): TCard[];

  /** Runs after selectedDeck changes, before the order control is patched. */
  protected onDeckSelected(): void {}

  /** Runs after selectedCard changes, before the deck control is patched. */
  protected onCardSelected(): void {}

  /** Sets derived fields on selectedCard just before it is sent. */
  protected prepareCardForSave(): void {}

  /** Sets derived fields on selectedDeck just before it is sent. */
  protected prepareDeckForSave(): void {}

  ngOnInit(): void {
    this.loading = true;

    this.dataSource = new MatTableDataSource();
    this.emptyDeck = this.createEmptyDeck();
    this.emptyDeck.id = -1;
    this.emptyCard = this.createEmptyCard();
    this.loadingCard = false;
    this.loadingDeck = false;

    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.initDecks();
  }

  initDecks(): void {
    this.service.getDecks(this.currentUser.id)
      .subscribe(decks => {
        this.decks = decks;
        this.decksOptions = this.getDecksOptions();
        this.ordersOptions = this.getOrdersOptions();
        this.setDeck(0, 0);
        this.loading = false;
      });
  }

  getDeck(deckId: number): void {
    this.service.getDeck(this.currentUser.id, deckId)
      .subscribe(deck => { this.selectedDeck = deck; });
  }

  getDecks(): void {
    this.service.getDecks(this.currentUser.id)
      .subscribe(decks => {
        this.decks = decks;
        this.decksOptions = this.getDecksOptions();
        this.refreshSelectedDeck();
      });
  }

  getAndSetDecks(deckId: number, cardIndex: number): Observable<TDeck[]> {
    return this.service.getDecks(this.currentUser.id).pipe(
      tap(decks => {
        this.decks = decks;
        this.decksOptions = this.getDecksOptions();
        this.setDeck(deckId, cardIndex);
      })
    );
  }

  /*
   * User-initiated selection. Moving to a different deck or item, or starting a
   * new one, drops any alert left over from the previous one, since it no
   * longer refers to what is on screen. These stay separate from the methods
   * they wrap because the load, save and delete flows call those internally to
   * refresh the table, and must not clear the alert they have just raised.
   */

  selectDeckByIndex(index: number): void {
    this.alertService.clear();
    this.setDeckByIndex(index);
  }

  selectDeck(deckId: number, cardIndex: number): void {
    this.alertService.clear();
    this.setDeck(deckId, cardIndex);
  }

  selectCard(index: number): void {
    this.alertService.clear();
    this.setCard(index);
  }

  createNewCard(): void {
    this.alertService.clear();
    this.resetSelectedCard();
  }

  setDeckByIndex(index: number): void {

    this.selectedDeck = this.decks[index + 1];

    this.onDeckSelected();

    this.ordersForm.controls['ordersOptions'].patchValue(this.ordersOptions[this.selectedDeck.sortOrder - 1], {onlySelf: true});

    this.showItems(0);

    return;
  }

  setDeck(deckId: number, cardIndex: number): void {

    // TODO use map
    var count = 0;
    this.decks.forEach(deck => {
      if (deck.id === deckId) {

        this.selectedDeck = this.decks[count];

        this.onDeckSelected();

        this.ordersForm.controls['ordersOptions'].patchValue(this.ordersOptions[this.selectedDeck.sortOrder - 1], {onlySelf: true});

        this.showItems(cardIndex);

        return;
      }
      count++;
    });
  }

  setCard(index: number): void {

    // Deck Overview cannot set card
    if (this.selectedDeck.id === 0) {
      return;
    }

    this.selectedCard = this.itemsOf(this.selectedDeck)[index];

    this.onCardSelected();

    var count = 0;
    var deckIndex = 0;
    this.decks.forEach(deck => {
      if (deck.id == this.selectedDeck.id) {
        deckIndex = count;
      }
      count++;
    });
    this.decksForm.controls['decksOptions'].patchValue(this.decksOptions[deckIndex-1].id, {onlySelf: true});
  }

  refreshSelectedDeck(): void {
    var id = this.selectedDeck.id;
    this.decks.forEach(deck => {
      if (deck.id === id) {
        this.selectedDeck = deck;
        return;
      }
    });
  }

  resetSelectedDeck(): void {
    this.selectedDeck = this.emptyDeck;
  }

  resetSelectedCard(): void {
    this.selectedCard = this.emptyCard;

    if (this.decksOptions[0]) {
      var index = 0;
      var id = this.selectedDeck.id;
      this.decks.forEach(deck => {
        if (deck.id === id) {
          this.decksForm.controls['decksOptions'].patchValue(this.decksOptions[index - 1].id, {onlySelf: true});
        }
        index++;
      });

    }
    else {
      this.decksForm.controls['decksOptions'].patchValue(0, {onlySelf: true});
    }
  }

  saveCard(): void {
    this.loadingCard = true;
    this.prepareCardForSave();
    var newDeckId = this.convertDeckForm();

    this.service.saveCard(this.currentUser.id, newDeckId, this.selectedCard).
      pipe(first()).subscribe({
        next: card => {
          if (!card) {
            this.alertService.error(this.missingCardMessage);
            this.loadingCard = false;
            return;
          }
          this.alertService.success("Success");
          this.service.getDecks(this.currentUser.id)
          .subscribe(decks => {
            this.decks = decks;
            this.decksOptions = this.getDecksOptions();
            this.refreshSelectedDeck();

            var index = 0;
            var cardFound = false;
            this.itemsOf(this.selectedDeck).forEach(card => {
              if (card.id === this.selectedCard.id) {
                cardFound = true;
                this.setDeck(this.selectedDeck.id, index);
              }
              index++;
            });

            // Case for save new card
            if (!cardFound) {
              this.setDeck(this.selectedDeck.id, this.itemsOf(this.selectedDeck).length - 1);
            }
            this.loadingCard = false;
          });
        },
        error: error => {
          this.alertService.error(error.error?.message || this.saveCardErrorMessage);
          this.loadingCard = false;
        }
      });
  }

  saveDeck(): void {
    this.loadingDeck = true;
    this.prepareDeckForSave();
    this.selectedDeck.sortOrder = this.ordersForm.controls["ordersOptions"].value;
    const isNew = this.selectedDeck.id === 0;
    this.service.saveDeck(this.currentUser.id, this.selectedDeck).pipe(switchMap(deck => this.getAndSetDecks(deck.id, 0)),
      finalize(() => this.loadingDeck = false)).subscribe({
        next: () => this.alertService.success(this.deckSavedMessage(isNew))
      });
  }

  deleteCard(): void {
    this.loadingCard = true;
    this.service.deleteCard(this.currentUser.id, this.selectedDeck.id, this.selectedCard.id)
      .pipe(switchMap(() => this.getAndSetDecks(this.selectedDeck.id, 0)), finalize(() => this.loadingCard = false)).subscribe();
  }

  deleteDeck(): void {
    this.loadingDeck = true;
    this.service.deleteDeck(this.currentUser.id, this.selectedDeck.id).pipe(switchMap(deck => this.getAndSetDecks(0, 0)),
       finalize(() => this.loadingDeck = false)).subscribe();
  }

  refreshDeck(): void {
    this.loadingCard = true;
    this.service.refreshDeck(this.currentUser.id, this.selectedDeck.id)
      .subscribe(deck => { this.setDeck(this.selectedDeck.id, 0); this.loadingCard = false; this.getTotalCost(); });
  }

  getTotalQuantity() {
    var total = 0;
    var items = this.selectedDeck && this.itemsOf(this.selectedDeck);
    if (items) {
      items.forEach(element => {
        total += element.quantity;
      });
    }

    return total;
  }

  getTotalPurchasePrice() {
    var total = 0;
    var items = this.selectedDeck && this.itemsOf(this.selectedDeck);
    if (items) {
      items.forEach(element => {
        total += element.purchasePrice;
      });
    }

    return total;
  }

  getTotalCost() {
    var total = 0;
    var items = this.selectedDeck && this.itemsOf(this.selectedDeck);
    if (items) {
      items.forEach(element => {
        total += (element.marketPrice * element.quantity);
      });
    }

    return total;
  }

  getDecksOptions() {

    if (this.decks == null) return [];

    var data = [];
    var count = 0;
    this.decks.forEach(deck => {
      data.push({id: count++, name: deck.name});
    });

    return data.slice(1);
  }

  getOrdersOptions() {
    if (this.decks == null) return [];
    var data = [];
    for (var i = 1; i < this.decks.length; ++i) {
      data.push(i);
    }
    return data;
  }

  convertDeckForm(): number {

    return this.decks[this.decksForm.controls["decksOptions"].value].id;
  }

  convertVersionForm(): string {

    return this.versionsOptions[this.versionsForm.controls["versionsOptions"].value].name;
  }

  /** Pushes the selected deck's items into the table and selects one of them. */
  private showItems(cardIndex: number): void {
    var items = this.itemsOf(this.selectedDeck);
    if (items.length != 0) {
      this.dataSource.data = items;
      this.setCard(cardIndex);
    }
    else {
      this.dataSource.data = [];
      this.resetSelectedCard();
    }
  }
}
