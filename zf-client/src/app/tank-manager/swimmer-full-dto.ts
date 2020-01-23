import {TankDto} from './tank-dto';
import {StockDto} from '../stock-manager/dto/stock-dto';

export class SwimmerFullDto {
  stockId: number;
  tankId: number;
  number?: number;
  comment?: number;
  stock: StockDto;
  tank: TankDto;
}

