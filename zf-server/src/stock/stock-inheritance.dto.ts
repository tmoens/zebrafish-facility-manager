import { Stock } from './stock.entity';

export class StockInheritanceDTO {
  id: number;
  name: string;
  rootyness: number = 0;
  mom: string = null;
  dad: string = null;
  alive: boolean = false;
  constructor(s: Stock) {
    this.id = s.id;
    this.name = s.name;
  }
}

export function compareStockInheritanceDTOs(a: StockInheritanceDTO, b: StockInheritanceDTO): number {
  if (a.rootyness > b.rootyness) {return -1; }
  if (a.rootyness < b.rootyness) {return 1; }
  if (b.name < a.name) {return 1; }
  if (a.name < b.name) {return -1; }
  return 0;
}
