import { Component } from '@angular/core';
import { SealedCollection } from '../_model/sealedCollection';
import { Series } from '../_shared/snapshot-series';

/*
 * The sealed page: the charts for every collection, then the collection and product tables
 * beneath them.
 *
 * The series come from the detail screen's own load rather than a second request of our own,
 * so the charts redraw whenever Refresh Values, a save or a delete brings back new figures.
 */
@Component({
  selector: 'app-sealed',
  templateUrl: './sealed.component.html',
  styleUrls: ['./sealed.component.scss'],
  standalone: false
})
export class SealedComponent {

  series: Series[] = [];

  onCollectionsLoaded(collections: SealedCollection[]): void {
    // Index 0 is the server's overview object, which carries no snapshots of its own
    this.series = collections.slice(1)
      .filter(collection => collection.sealedCollectionSnapshots && collection.sealedCollectionSnapshots.length > 0)
      .map(collection => ({ name: collection.name, snapshots: collection.sealedCollectionSnapshots }));
  }
}
