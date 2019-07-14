import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';
import { debounceTime, first } from 'rxjs/operators';
import { Card } from '../_model/card';
import { Deck } from '../_model/deck';
import { User } from '../_model/user';
import { AlertService } from '../_service/alert.service';
import { DeckService } from '../_service/deck.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
})
export class DeckDetailComponent implements OnInit {

  currentUser: User;

  searchText: string = "";
  versions: any[];

  dataSource: MatTableDataSource<Card>;
  displayedColumns: string[] = ['card', 'condition', 'set', 
    'quantity', 'totalPurchasePrice', 'totalValue'];

  decks: Deck[];

  emptyDeck: Deck;
  selectedDeck: Deck;

  emptyCard: Card;
  selectedCard: Card;

  loading: boolean;
  loading2: boolean;

  foilForm: FormGroup;
  foilOptions = [];

  conditionForm: FormGroup;
  conditionOptions = [];

  decksForm: FormGroup;
  decksOptions = [];

  formatsForm: FormGroup;
  formatsOptions = [];

  versionsForm: FormGroup;
  versionsOptions = [];

  matcher = new MyErrorStateMatcher();

  deckForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    format: ['', [Validators.required]]
  });

  cardForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    quantity: ['', [Validators.required]],
    purchasePrice: ['', [Validators.required]]
  });

  constructor(private alertService: AlertService, 
              private deckService: DeckService, 
              private formBuilder: FormBuilder) { 
    this.foilForm = this.formBuilder.group({
      foilOptions: ['']
    });

    this.conditionForm = this.formBuilder.group({
      conditionOptions: ['']
    });

    this.decksForm = this.formBuilder.group({
      decksOptions: ['']
    });

    this.formatsForm = this.formBuilder.group({
      formatsOptions: ['']
    });

    this.versionsForm = this.formBuilder.group({
      versionsOptions: ['']
    });
  }

  ngOnInit(): void {
    this.loading2 = true;

    this.dataSource = new MatTableDataSource();
    this.emptyDeck = new Deck();
    this.emptyDeck.id = -1;
    this.emptyCard = new Card();
    this.loading = false;

    this.foilOptions = this.getFoilOptions();
    this.conditionOptions = this.getConditionOptions();
    this.formatsOptions = this.getFormatsOptions();
    this.getVersions();

    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.initDecks();

    this.cardForm.valueChanges.pipe(debounceTime(500)).subscribe(change => {
      this.getVersionsForCard(change.name);
    });
  }

  initDecks(): void {
    this.deckService.getDecks(this.currentUser.id)
      .subscribe(decks => { 
        this.decks = decks; 
        this.decksOptions = this.getDecksOptions(); 
        this.setDeck(0, 0); 
        this.loading2 = false;
      });
  }

  getDeck(deckId: number): void {
    this.deckService.getDeck(this.currentUser.id, deckId)
      .subscribe(deck => { this.selectedDeck = deck; });
  }

  getDecks(): void {
    this.deckService.getDecks(this.currentUser.id)
      .subscribe(decks => { 
        this.decks = decks; 
        this.decksOptions = this.getDecksOptions(); 
        this.refreshSelectedDeck();
      });
  }

  getAndSetDecks(deckId: number, cardIndex: number) {
    this.deckService.getDecks(this.currentUser.id)
    .subscribe(decks => { 
      this.decks = decks; 
      this.decksOptions = this.getDecksOptions(); 
      this.setDeck(deckId, cardIndex);
    });
  }

  setDeck(deckId: number, cardIndex: number): void {

    // TODO use map
    var count = 0;
    this.decks.forEach(deck => {
      if (deck.id === deckId) {
        
        this.selectedDeck = this.decks[count]; 
        var format = 0;
        switch (this.selectedDeck.format) {
          case "Standard":
            break;
          case "Modern":
            format = 1;
            break;
          case "Legacy":
            format = 2;
            break;
          case "Vintage":
            format = 3;
            break;
          case "Commander":
            format = 4;
            break;
          case "Casual":
            format = 5;
            break;
        }
        this.formatsForm.controls['formatsOptions'].patchValue(this.formatsOptions[format].id, {onlySelf: true});

        if (this.selectedDeck.cards.length != 0) {
          this.dataSource.data = this.selectedDeck.cards;
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

    this.selectedCard = this.selectedDeck.cards[index];

    this.getVersionsForCard(this.selectedCard.name);

    var isFoil = 0;
    switch (this.selectedCard.isFoil) {
      case false:
        break;
      case true:
        isFoil = 1;
        break;
    }
    this.foilForm.controls['foilOptions'].patchValue(this.foilOptions[isFoil].id, {onlySelf: true});

    var condition = 0;
    switch (this.selectedCard.cardCondition) {
      case "Near Mint":
        break;
      case "Lightly Played":
        condition = 1;
        break;
      case "Moderately Played":
        condition = 2;
        break;
      case "Heavily Played":
        condition = 3;
        break;
      case "Damaged":
        condition = 4;
        break;
    }
    this.conditionForm.controls['conditionOptions'].patchValue(this.conditionOptions[condition].id, {onlySelf: true});

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
    this.foilForm.controls['foilOptions'].patchValue(this.foilOptions[0].id, {onlySelf: true});
    this.conditionForm.controls['conditionOptions'].patchValue(this.conditionOptions[0].id, {onlySelf: true});

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

    this.getVersions();
  }

  saveCard(): void {

    this.selectedCard.isFoil = this.convertFoilForm();
    this.selectedCard.cardCondition = this.convertConditionForm();
    this.selectedCard.set = this.convertVersionForm();
    var newDeckId = this.convertDeckForm();

    this.deckService.saveCard(this.currentUser.id, newDeckId, this.selectedCard).
      pipe(first()).subscribe(card => { 
        // TODO add proper loading
        this.alertService.success("Success");
        this.deckService.getDecks(this.currentUser.id)
        .subscribe(decks => { 
          this.decks = decks; 
          this.decksOptions = this.getDecksOptions(); 
          this.refreshSelectedDeck();
          if (this.selectedDeck.id !== newDeckId) {
            // Move card called
            // TODO set to new card
            this.setDeck(newDeckId, 0);
          }
          else {
            this.setDeck(this.selectedDeck.id, this.selectedDeck.cards.length - 1);
          }
        },
        error => {
          this.alertService.error(error.error.message);
      });
    });
  }

  saveDeck(): void {
    this.selectedDeck.format = this.convertFormatForm();
    this.deckService.saveDeck(this.currentUser.id, this.selectedDeck).subscribe(deck => { 
      this.getAndSetDecks(deck.id, 0);
    });
  }

  deleteCard(): void {
    this.deckService.deleteCard(this.currentUser.id, this.selectedDeck.id, this.selectedCard.id).
      subscribe(deck => { this.getAndSetDecks(this.selectedDeck.id, 0); });
  }

  deleteDeck(): void {
    this.deckService.deleteDeck(this.currentUser.id, this.selectedDeck.id).
      subscribe(deck => { this.getAndSetDecks(0, 0); });
  }

  refreshDeck():void {
    this.loading = true;
    this.deckService.refreshDeck(this.currentUser.id, this.selectedDeck.id)
      .subscribe(deck => { this.setDeck(this.selectedDeck.id, 0); this.loading = false; this.getTotalCost(); });
  }

  getTotalQuantity() {
    var total = 0;
    if (this.selectedDeck && this.selectedDeck.cards) {
      this.selectedDeck.cards.forEach(element => {
        total += element.quantity;
      });
    }

    return total;
  }

  getTotalPurchasePrice() {
    var total = 0;
    if (this.selectedDeck && this.selectedDeck.cards) {
      this.selectedDeck.cards.forEach(element => {
        total += (element.purchasePrice) | 0;
      });
    }

    return total;
  }

  getTotalCost() {
    var total = 0;
    if (this.selectedDeck && this.selectedDeck.cards) {
      this.selectedDeck.cards.forEach(element => {
        total += (element.marketPrice * element.quantity) | 0;
      });
    }

    return total;
  }

  getFoilOptions() {
    return [
      { id: '1', name: 'Non-foil' },
      { id: '2', name: 'Foil' }
    ];
  }

  getConditionOptions() {
    return [
      { id: '1', name: 'Near Mint' },
      { id: '2', name: 'Lightly Played' },
      { id: '3', name: 'Moderately Played' },
      { id: '4', name: 'Heavily Played' },
      { id: '5', name: 'Damaged' }
    ];
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

  getFormatsOptions() {
    return [
      { id: '1', name: 'Standard' },
      { id: '2', name: 'Modern' },
      { id: '3', name: 'Legacy' },
      { id: '4', name: 'Vintage' },
      { id: '5', name: 'Commander' },
      { id: '6', name: 'Casual' }
    ];
  }

  getVersions() {
    this.deckService.getVersions().
      subscribe(v => { 

        var data = [];
        var count = 0;

        v.forEach(version => {
          data.push({id: count++, name: version});
        });
        this.versionsOptions = data;
        this.versions = data;
        this.versionsForm.controls['versionsOptions'].patchValue(this.versionsOptions[0].id, {onlySelf: true});
      });
  }

  getVersionsForCard(cardName: string) {
    this.deckService.getVersionsByCardName(cardName).pipe(first()).
      subscribe(v => { 

        if (!v) {
          return;
        }
        
        this.alertService.success("");

        var data = [];
        var count = 0;

        v.forEach(version => {
          data.push({id: count++, name: version});
        });
        this.versionsOptions = data;
        this.versions = data;

        var count2 = 0;
        var versionIndex = 0;

        this.versions.forEach(v => {
          if (v.name === this.selectedCard.set) {
            versionIndex = count2;
          }
          count2++;
        });
        this.versionsForm.controls['versionsOptions'].patchValue(this.versionsOptions[versionIndex].id, {onlySelf: true});
      },
      error => {
        this.alertService.error(error.error.message);
    });
  }

  convertFoilForm(): boolean {

    if (this.foilForm.controls["foilOptions"].value === "2") {
      return true;
    }
    return false;
  }

  convertConditionForm(): string {

    switch (this.conditionForm.controls["conditionOptions"].value) {
      case "1":
        return "Near Mint";
      case "2":
        return "Lightly Played";
      case "3":
        return "Moderately Played";
      case "4":
        return "Heavily Played";
      case "5":
        return "Damaged";
    }
  }

  convertDeckForm(): number {

    return this.decks[this.decksForm.controls["decksOptions"].value].id;
  }

  convertVersionForm(): string {

    return this.versionsOptions[this.versionsForm.controls["versionsOptions"].value].name;
  }

  convertFormatForm(): string {

    switch (this.formatsForm.controls["formatsOptions"].value) {
      case "1":
        return "Standard";
      case "2":
        return "Modern";
      case "3":
        return "Legacy";
      case "4":
        return "Vintage";
      case "5":
        return "Commander";
      case "6":
        return "Casual";
    }
  }

}
