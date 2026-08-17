import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Sealed } from '../_model/sealed';
import { SealedCollection } from '../_model/sealedCollection';
import { AlertService } from '../_service/alert.service';
import { SealedService } from '../_service/sealed.service';
import { DetailBaseComponent } from '../_shared/detail-base.component';

@Component({
  selector: 'app-sealed-detail',
  templateUrl: './sealed-detail.component.html',
  styleUrls: ['./sealed-detail.component.scss'],
  standalone: false
})
export class SealedDetailComponent extends DetailBaseComponent<SealedCollection, Sealed> {

  displayedColumns: string[] = ['card', 'quantity', 'totalPurchasePrice', 'totalValue'];

  deckForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    order: ['', [Validators.required]]
  });

  protected saveCardErrorMessage = 'No sealed product found with that name. Please check the name and try again.';
  protected missingCardMessage = 'No sealed product found with that name. Please check the name and try again.';

  constructor(alertService: AlertService,
              sealedService: SealedService,
              formBuilder: FormBuilder) {
    super(alertService, sealedService, formBuilder);
  }

  protected deckSavedMessage(isNew: boolean): string {
    return isNew ? 'Sealed collection successfully created' : 'Sealed collection updated';
  }

  protected createEmptyDeck(): SealedCollection {
    return new SealedCollection();
  }

  protected createEmptyCard(): Sealed {
    return new Sealed();
  }

  protected itemsOf(deck: SealedCollection): Sealed[] {
    return deck.sealed;
  }
}
