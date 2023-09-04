import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';
import { debounceTime, first } from 'rxjs/operators';
import { Sealed } from '../_model/sealed';
import { SealedCollection } from '../_model/sealedCollection';
import { User } from '../_model/user';
import { AlertService } from '../_service/alert.service';
import { NonZero } from '../_helper/non-zero.validator';
import { SealedService } from '../_service/sealed.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-sealed-detail',
  templateUrl: './sealed-detail.component.html',
  styleUrls: ['./sealed-detail.component.scss'],
})
export class SealedDetailComponent implements OnInit {
  currentUser: User;

  searchText: string = "";
  versions: any[];

  dataSource: MatTableDataSource<Sealed>;
  displayedColumns: string[] = ['card', 'quantity', 'totalPurchasePrice', 'totalValue'];
  displayedColumnsDecks: string[] = ['card', 'totalPurchasePrice', 'totalValue'];

  decks: SealedCollection[];

  emptyDeck: SealedCollection;
  selectedDeck: SealedCollection;

  emptyCard: Sealed;
  selectedCard: Sealed;

  loading: boolean;
  loading2: boolean;

  decksForm: FormGroup;
  decksOptions = [];

  ordersForm: FormGroup;
  ordersOptions = [];

  versionsForm: FormGroup;
  versionsOptions = [];

  matcher = new MyErrorStateMatcher();

  deckForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    order: ['', [Validators.required]]
  });

  cardForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    quantity: ['', [Validators.required]],
    purchasePrice: ['', [Validators.required]]
  }, {validator: [NonZero('quantity'), NonZero('purchasePrice')]});

  constructor(private alertService: AlertService, 
              private sealedService: SealedService, 
              private formBuilder: FormBuilder) { 
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

  ngOnInit(): void {
    this.loading2 = true;
    this.dataSource = new MatTableDataSource();
    this.emptyDeck = new SealedCollection();
    this.emptyDeck.id = -1;
    this.emptyCard = new Sealed();
    this.loading = false;
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.initDecks();
  }

  initDecks(): void {
    this.sealedService.getDecks(this.currentUser.id)
      .subscribe(decks => { 
        this.decks = decks; 
        this.decksOptions = this.getDecksOptions(); 
        this.ordersOptions = this.getOrdersOptions();
        this.setDeck(0, 0); 
        this.loading2 = false;
      });
  }

  getDeck(deckId: number): void {
    this.sealedService.getDeck(this.currentUser.id, deckId)
      .subscribe(deck => { this.selectedDeck = deck; });
  }

  getDecks(): void {
    this.sealedService.getDecks(this.currentUser.id)
      .subscribe(decks => { 
        this.decks = decks; 
        this.decksOptions = this.getDecksOptions(); 
        this.refreshSelectedDeck();
      });
  }

  getAndSetDecks(deckId: number, cardIndex: number) {
    this.sealedService.getDecks(this.currentUser.id)
    .subscribe(decks => { 
      this.decks = decks; 
      this.decksOptions = this.getDecksOptions(); 
      this.setDeck(deckId, cardIndex);
    });
  }

  setDeckByIndex(index: number): void {
    this.selectedDeck = this.decks[index + 1]; 

    this.ordersForm.controls['ordersOptions'].patchValue(this.ordersOptions[this.selectedDeck.sortOrder - 1], {onlySelf: true});

    if (this.selectedDeck.sealed.length != 0) {
      this.dataSource.data = this.selectedDeck.sealed;
      this.setCard(0);
    } 
    else {
      this.dataSource.data = []; 
      this.resetSelectedCard();
    }

    return;
  }

  setDeck(deckId: number, cardIndex: number): void {
    // TODO use map
    var count = 0;
    this.decks.forEach(deck => {
      if (deck.id === deckId) {
        
        this.selectedDeck = this.decks[count]; 

        this.ordersForm.controls['ordersOptions'].patchValue(this.ordersOptions[this.selectedDeck.sortOrder - 1], {onlySelf: true});

        if (this.selectedDeck.sealed.length != 0) {
          this.dataSource.data = this.selectedDeck.sealed;
          this.setCard(cardIndex);
        } 
        else {
          this.dataSource.data = []; 
          this.resetSelectedCard();
        }

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

    this.selectedCard = this.selectedDeck.sealed[index];

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
    var newDeckId = this.convertDeckForm();

    this.sealedService.saveCard(this.currentUser.id, newDeckId, this.selectedCard).
      pipe(first()).subscribe(card => { 
        // TODO add proper loading
        this.alertService.success("Success");
        this.sealedService.getDecks(this.currentUser.id)
        .subscribe(decks => { 
          this.decks = decks; 
          this.decksOptions = this.getDecksOptions(); 
          this.refreshSelectedDeck();

          var index = 0;
          var cardFound = false;
          this.selectedDeck.sealed.forEach(card => {
            if (card.id === this.selectedCard.id) {
              cardFound = true;
              this.setDeck(this.selectedDeck.id, index);
            }
            index++;
          });

          // Case for save new card
          if (!cardFound) {
            this.setDeck(this.selectedDeck.id, this.selectedDeck.sealed.length - 1);
          }
        });
      },
      error => {
        console.log("errr");
        this.alertService.error(error.error.message);
    });
  }

  saveDeck(): void {
    this.selectedDeck.sortOrder = this.ordersForm.controls["ordersOptions"].value
    this.sealedService.saveDeck(this.currentUser.id, this.selectedDeck).subscribe(deck => { 
      this.getAndSetDecks(deck.id, 0);
    });
  }

  deleteCard(): void {
    this.sealedService.deleteCard(this.currentUser.id, this.selectedDeck.id, this.selectedCard.id).
      subscribe(deck => { this.getAndSetDecks(this.selectedDeck.id, 0); });
  }

  deleteDeck(): void {
    this.sealedService.deleteDeck(this.currentUser.id, this.selectedDeck.id).
      subscribe(deck => { this.getAndSetDecks(0, 0); });
  }

  refreshDeck():void {
    this.loading = true;
    this.sealedService.refreshDeck(this.currentUser.id, this.selectedDeck.id)
      .subscribe(deck => { this.setDeck(this.selectedDeck.id, 0); this.loading = false; this.getTotalCost(); });
  }

  getTotalQuantity() {
    var total = 0;
    if (this.selectedDeck && this.selectedDeck.sealed) {
      this.selectedDeck.sealed.forEach(element => {
        total += element.quantity;
      });
    }

    return total;
  }

  getTotalPurchasePrice() {
    var total = 0;
    if (this.selectedDeck && this.selectedDeck.sealed) {
      this.selectedDeck.sealed.forEach(element => {
        total += element.purchasePrice;
      });
    }

    return total;
  }

  getTotalCost() {
    var total = 0;
    if (this.selectedDeck && this.selectedDeck.sealed) {
      this.selectedDeck.sealed.forEach(element => {
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
}
