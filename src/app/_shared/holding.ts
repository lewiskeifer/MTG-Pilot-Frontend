/**
 * One owned item - a single card or a sealed product - with what it cost, what it is worth, and
 * what it was worth at the start of each range the page can be set to.
 *
 * The baselines come from the server, which records one price a day per printing. That series
 * starts the night the server began keeping it, so a window reaching back further than the
 * history goes has no entry rather than a zero: an item cannot be ranked over a period nobody
 * priced it in.
 */
export interface Holding {
  name: string;
  /** The deck or collection holding it, so two rows with the same name stay apart. */
  location: string;
  quantity: number;
  /** What was paid for every copy held, not the price of one - the API totals it already. */
  purchasePrice: number;
  /** Market price of one copy times the quantity held. */
  value: number;
  /** What one copy was worth at each range's start, keyed by the range's day count. */
  baselinePrices: { [days: string]: number };
}
