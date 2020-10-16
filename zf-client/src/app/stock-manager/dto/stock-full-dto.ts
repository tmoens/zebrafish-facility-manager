import {MutationDto} from '../../mutation-manager/mutation-dto';
import {TransgeneDto} from '../../transgene-manager/transgene-dto';
import {StockDto} from './stock-dto';
import {ZfGenericDto} from '../../zf-generic/zfgeneric-dto';
import {StockSwimmerDto} from '../../tank-manager/stock-swimmer-dto';
import {Type} from 'class-transformer';
import 'reflect-metadata';

export class StockFullDto extends ZfGenericDto {
  name: string = null;
  number: number = null;
  subNumber: number = null;
  description: string = null;
  fertilizationDate: string = null;
  pi: string = null;
  researcher: string = null;
  matIdInternal: number = null;
  externalMatId: string = null;
  externalMatDescription: string = null;
  patIdInternal: number = null;
  externalPatId: string = null;
  externalPatDescription: string = null;
  comment: string = null;
  @Type(() => StockDto)
  matStock: StockDto = null;
  @Type(() => StockDto)
  patStock: StockDto = null;
  swimmers: StockSwimmerDto[] = [];
  @Type(() => TransgeneDto)
  transgenes: TransgeneDto[] = [];
  @Type(() => MutationDto)
  mutations: MutationDto[] = [];
  offspringCount: number = null;
  @Type(() => StockDto)
  offspring: StockDto[] = [];
  nextSubStockNumber: number = null;
  parentsEditable: boolean = false;
  alleleSummary: string = null;

  constructor() {
    super();
  }

  test(): string {
    return "Why not?";
  }
}
