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
}