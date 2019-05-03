export class Card {

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

    id: number;
    name: string;
    version: string;
    isFoil: boolean;
    condition: string;
    purchasePrice: number;
    value: number;
    quantity: number;
  }