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
}