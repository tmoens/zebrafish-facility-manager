import {MutationDto} from '../../mutation-manager/mutation-dto';
import {TransgeneDto} from '../../transgene-manager/transgene-dto';
import {StockDto} from './stock-dto';
import {ZfGenericDto} from '../../zf-generic/zfgeneric-dto';
import {StockSwimmerDto} from '../../tank-manager/stock-swimmer-dto';

export class StockFullDto extends ZfGenericDto {
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
  swimmers: StockSwimmerDto[] = [];
  transgenes: TransgeneDto[] = [];
  mutations: MutationDto[] = [];
  offspringCount: number = null;
  offspring: StockDto[] = [];
  nextSubStockNumber: number = null;
  parentsEditable: boolean = false;
}


