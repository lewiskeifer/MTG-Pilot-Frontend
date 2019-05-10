export class Card {

  constructor(name?: string, value?: number) {
    this.name = name || "";
    this.value = value || 0;
  }

  id: number;
  name: string;
  version: string;
  isFoil: boolean;
  condition: string;
  purchasePrice: number;
  quantity: number;
  value: number;
}