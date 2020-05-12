import {MutationDto} from '../../mutation-manager/mutation-dto';
import {TransgeneDto} from '../../transgene-manager/transgene-dto';
import {StockDto} from './stock-dto';
import {ZfGenericDto} from '../../zf-generic/zfgeneric-dto';

// This is like the stockFullDto, but it does not include the offspring
// or swimmers for the stock.
// It was introduced for a slightly lighter-weight object that can be used
// in the StockWalker to present a fairly comprehensive view of a stock.

export class StockMediumDto extends ZfGenericDto {
  name: string = null;
  number: number = null;
  subNumber: number = null;
  description: string = null;
  fertilizationDate: string = null;
  pi: string = null;
  researcher: string = null;
  background: number = null;
  matIdInternal: number = null;
  externalMatId: string = null;
  externalMatDescription: string = null;
  patIdInternal: number = null;
  externalPatId: string = null;
  externalPatDescription: string = null;
  comment: string = null;
  matStock: StockDto = null;
  patStock: StockDto = null;
  transgenes: TransgeneDto[] = [];
  mutations: MutationDto[] = [];
  offspringCount: number = null;
  nextSubStockNumber: number = null;
  parentsEditable: boolean = false;
}


