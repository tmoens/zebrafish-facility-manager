import { TankDto } from '../tank/tank.dto';
import { Stock } from '../stock/stock.entity';

export class SwimmerFullDto {
  stockId: string;

  tankId: string;

  stock: Stock;

  tank: TankDto;

  number?: string;

  comment?: string;

  public constructor( init: Partial<SwimmerFullDto>) {
    Object.assign(this, init);
  }
}
