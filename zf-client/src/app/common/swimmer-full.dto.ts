import {StockDto} from '../stock-manager/dto/stock-dto';
import {SwimmerDto} from './swimmer.dto';

export class SwimmerFullDto extends SwimmerDto {
  stock?: StockDto;
}

