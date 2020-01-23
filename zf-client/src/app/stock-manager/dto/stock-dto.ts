import {ZfGenericDto} from '../../zf-generic/zfgeneric-dto';
import {TransgeneDto} from '../../transgene-manager/transgene-dto';
import {MutationDto} from '../../mutation-manager/mutation-dto';

export class StockDto extends ZfGenericDto {
  // id: number = null; // inherited from generic
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
  transgenes: TransgeneDto[] = [];
  mutations: MutationDto[] = [];
}


