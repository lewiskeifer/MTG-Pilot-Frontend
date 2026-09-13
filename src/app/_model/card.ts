export class Card {

  constructor(name?: string, value?: number) {
    this.name = name || "";
    this.marketPrice = value || 0;
  }

  id: number;
  groupId: number;
  name: string;
  set: string;
  abbreviation: string;
  isFoil: boolean;
  cardCondition: string;
  purchasePrice: number;
  quantity: number;
  marketPrice: number;
  url: string;
  /*
   * What one copy was worth at the start of each range the dashboard offers, keyed by the same
   * day counts the range buttons use and "0" for all time. Absent where no price was recorded
   * that far back - the history only runs from the night the server started keeping it.
   */
  baselinePrices: { [days: string]: number };
}