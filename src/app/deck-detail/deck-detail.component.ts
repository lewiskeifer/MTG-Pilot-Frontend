import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, first } from 'rxjs/operators';
import { Card } from '../_model/card';
import { Deck } from '../_model/deck';
import { AlertService } from '../_service/alert.service';
import { DeckService } from '../_service/deck.service';
import { DetailBaseComponent } from '../_shared/detail-base.component';

@Component({
  selector: 'app-deck-detail',
  templateUrl: './deck-detail.component.html',
  styleUrls: ['./deck-detail.component.scss'],
  standalone: false
})
export class DeckDetailComponent extends DetailBaseComponent<Deck, Card> {

  displayedColumns: string[] = ['card', 'condition', 'set',
    'quantity', 'totalPurchasePrice', 'totalValue'];

  foilForm: FormGroup;
  foilOptions = [];

  conditionForm: FormGroup;
  conditionOptions = [];

  formatsForm: FormGroup;
  formatsOptions = [];

  deckForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    format: ['', [Validators.required]],
    order: ['', [Validators.required]]
  });

  protected saveCardErrorMessage = 'Card could not be saved. Please try again.';

  constructor(alertService: AlertService,
              private deckService: DeckService,
              formBuilder: FormBuilder) {
    super(alertService, deckService, formBuilder);

    this.foilForm = this.formBuilder.group({
      foilOptions: ['']
    });

    this.conditionForm = this.formBuilder.group({
      conditionOptions: ['']
    });

    this.formatsForm = this.formBuilder.group({
      formatsOptions: ['']
    });
  }

  override ngOnInit(): void {
    this.foilOptions = this.getFoilOptions();
    this.conditionOptions = this.getConditionOptions();
    this.formatsOptions = this.getFormatsOptions();

    super.ngOnInit();

    this.cardForm.valueChanges.pipe(debounceTime(500)).subscribe(change => {
      this.getVersionsForCard(change.name);
    });
  }

  protected createEmptyDeck(): Deck {
    return new Deck();
  }

  protected createEmptyCard(): Card {
    return new Card();
  }

  protected itemsOf(deck: Deck): Card[] {
    return deck.cards;
  }

  protected override onDeckSelected(): void {
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
  }

  protected override onCardSelected(): void {
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
  }

  override resetSelectedCard(): void {
    super.resetSelectedCard();

    this.foilForm.controls['foilOptions'].patchValue(this.foilOptions[0].id, {onlySelf: true});
    this.conditionForm.controls['conditionOptions'].patchValue(this.conditionOptions[0].id, {onlySelf: true});

    this.getVersions();
  }

  protected override prepareCardForSave(): void {
    this.selectedCard.isFoil = this.convertFoilForm();
    this.selectedCard.cardCondition = this.convertConditionForm();
    this.selectedCard.set = this.convertVersionForm();
  }

  protected override prepareDeckForSave(): void {
    this.selectedDeck.format = this.convertFormatForm();
  }

  protected override onDeckSaved(isNew: boolean): void {
    this.alertService.success(isNew ? 'Deck successfully created' : 'Deck updated');
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
