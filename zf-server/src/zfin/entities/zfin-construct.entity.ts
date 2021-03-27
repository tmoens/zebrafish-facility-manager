import { Zfin } from './zfin.entity';

export class ZfinConstruct extends Zfin {
  primaryIdentifier: string;
  name: string;
  symbol: string;

  static get selectFields(): string[] {
    return ['primaryIdentifier', 'name', 'symbol'];
  }
}
