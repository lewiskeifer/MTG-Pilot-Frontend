import { DeckSnapshot } from '../_model/deckSnapshot';

export interface Series {
  name: string;
  snapshots: DeckSnapshot[];
  /** Which half of the collection this came from. Deck and collection names can collide. */
  group?: string;
}

export function dateKeyOf(snapshot: DeckSnapshot): string {
  return snapshot.timestamp.substr(0, 10);
}

/*
 * Every date any series has a snapshot for, in order. Series are lined up by date rather than
 * by array position: right-aligning the arrays meant one deck holding an extra snapshot pushed
 * a hard zero onto every other deck's earliest point, which drew as a cliff on the chart.
 */
export function collectDates(series: Series[]): string[] {
  const keys = new Set<string>();
  series.forEach(entry => entry.snapshots.forEach(snapshot => keys.add(dateKeyOf(snapshot))));
  return Array.from(keys).sort();
}

/*
 * One entry per date. A series with no snapshot on a date carries its last known figures
 * forward, and is null on the dates before it has any snapshot at all.
 */
export function densify(snapshots: DeckSnapshot[], dates: string[]): DeckSnapshot[] {

  const byDate = new Map<string, DeckSnapshot>();
  snapshots.forEach(snapshot => byDate.set(dateKeyOf(snapshot), snapshot));

  var carried: DeckSnapshot = null;
  return dates.map(date => {
    carried = byDate.get(date) || carried;
    return carried;
  });
}

// The sum of every series at each date - the total its parts add up to.
export function aggregate(series: Series[], dates: string[]): DeckSnapshot[] {

  const columns = series.map(entry => densify(entry.snapshots, dates));

  return dates.map((date, index) => {
    var value = 0;
    var purchasePrice = 0;
    columns.forEach(column => {
      const snapshot = column[index];
      if (snapshot) {
        value += snapshot.value;
        purchasePrice += snapshot.purchasePrice;
      }
    });
    return { value: value, purchasePrice: purchasePrice, timestamp: date };
  });
}

// Built part by part so the date lands on local midnight; Date.parse of "YYYY-MM-DD" is UTC
// and would shift every point a day backwards for anyone west of Greenwich.
export function toLocalDate(date: string): Date {
  const parts = date.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

/*
 * Where a date range begins within a sorted list of dates. Everything scoped by the range - the
 * charts, the values table, the movers and the headline delta - measures from here, so none of
 * them can disagree about which window they are showing. 0 days means the whole history.
 */
export function rangeStartIndex(dates: string[], rangeDays: number): number {

  if (rangeDays === 0 || dates.length === 0) {
    return 0;
  }

  const cutoff = toLocalDate(dates[dates.length - 1]);
  cutoff.setDate(cutoff.getDate() - rangeDays);

  var index = 0;
  while (index < dates.length && toLocalDate(dates[index]) < cutoff) {
    index++;
  }

  return index;
}

/** Names a range for display: "last 90 days", or "all time" for the whole history. */
export function rangeLabelOf(rangeDays: number): string {
  return rangeDays === 0 ? 'all time' : 'last ' + rangeDays + ' days';
}
