export class Sealed {

  constructor(name?: string, value?: number) {
    this.name = name || "";
    this.marketPrice = value || 0;
  }

  id: number;
  name: string;
  purchasePrice: number;
  quantity: number;
  marketPrice: number;
  url: string;
  /** As on a card: one product's price at the start of each range, keyed by day count. */
  baselinePrices: { [days: string]: number };
}