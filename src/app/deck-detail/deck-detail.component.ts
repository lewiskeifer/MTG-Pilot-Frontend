import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { Card } from '../_model/card';
import { Deck } from '../_model/deck';
import { User } from '../_model/user';
import { DeckService } from '../_service/deck.service';

@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
})
export class DeckDetailComponent implements OnInit {

  currentUser: User;

  dataSource: MatTableDataSource<Card>;
  displayedColumns: string[] = ['card', 'condition', 'version', 'quantity', 'totalPurchasePrice', 'totalValue'];

  decks: Deck[];

  emptyDeck: Deck;
  selectedDeck: Deck;

  emptyCard: Card;
  selectedCard: Card;

  loading: boolean;

  foilForm: FormGroup;
  foilOptions = [];

  conditionForm: FormGroup;
  conditionOptions = [];

  decksForm: FormGroup;
  decksOptions = [];

  constructor(private deckService: DeckService, private formBuilder: FormBuilder) { 
    this.foilForm = this.formBuilder.group({
      foilOptions: ['']
    });

    this.conditionForm = this.formBuilder.group({
      conditionOptions: ['']
    });

    this.decksForm = this.formBuilder.group({
      decksOptions: ['']
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    this.emptyDeck = new Deck();
    this.emptyCard = new Card();
    this.loading = false;
    this.foilOptions = this.getFoilOptions();
    this.conditionOptions = this.getConditionOptions();
    this.decksOptions = this.getDecksOptions();
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.initDecks();
  }

  initDecks(): void {
    this.deckService.getDecks(this.currentUser.id)
      .subscribe(decks => { this.decks = decks; this.decksOptions = this.getDecksOptions(); this.setDeck(0); });
  }

  getDeck(deckId: number): void {
    this.deckService.getDeck(this.currentUser.id, deckId)
      .subscribe(deck => { this.selectedDeck = deck; });
  }

  getDecks(): void {
    this.deckService.getDecks(this.currentUser.id)
      .subscribe(decks => { this.decks = decks; this.decksOptions = this.getDecksOptions(); this.setDeck(this.selectedDeck.id); });
  }

  setDeck(id: number): void {

    // TODO use map
    var count = 0;
    this.decks.forEach(deck => {
      if (deck.id === id) {
        
        this.selectedDeck = this.decks[count]; 
        this.setDeckHelper();

        return;
      }
      count++;
    });
  }

  setDeckHelper(): void {
    if (this.selectedDeck.cards.length != 0) {
      this.dataSource.data = this.selectedDeck.cards;
      this.setCard(0);
    } 
    else {
      this.dataSource.data = []; 
      this.resetSelectedCard();
    }
  }

  setCard(index: number): void {

    // Deck Overview cannot set card
    if (this.selectedDeck.id === 0) {
      return;
    }

    this.selectedCard = this.selectedDeck.cards[index];

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

  resetSelectedDeck(): void {
    this.selectedDeck = this.emptyDeck;
  }

  resetSelectedCard(): void {
    this.selectedCard = this.emptyCard;
  }

  saveCard(): void {

    this.selectedCard.isFoil = this.convertFoilForm();
    this.selectedCard.cardCondition = this.convertConditionForm();
    var newDeckId = this.convertDeckForm();

    this.deckService.saveCard(this.currentUser.id, newDeckId, this.selectedCard).
      subscribe(card => 
        { 
          this.getDecks(); 
          if (this.selectedDeck.id !== newDeckId) {
            // Move card called
            this.setCard(0);
          }
          else {
            this.selectedCard = card; 
          }
        });
  }

  deleteCard(): void {
    this.deckService.deleteCard(this.currentUser.id, this.selectedDeck.id, this.selectedCard.id).
      subscribe(deck => { this.getDecks(); this.setCard(0); });
  }

  saveDeck(): void {
    this.deckService.saveDeck(this.currentUser.id, this.selectedDeck).subscribe(deck => { this.getDecks(); });
  }

  deleteDeck(): void {
    this.deckService.deleteDeck(this.currentUser.id, this.selectedDeck.id).
      subscribe(deck => { this.getDecks(); this.setDeck(0); this.setCard(0); });
  }

  refreshDeck():void {
    this.loading = true;
    this.deckService.refreshDeck(this.currentUser.id, this.selectedDeck.id)
      .subscribe(deck => { this.setDeck(this.selectedDeck.id); this.loading = false; this.getTotalCost(); });
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

}
