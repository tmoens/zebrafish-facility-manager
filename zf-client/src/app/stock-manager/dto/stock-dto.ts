import {ZfGenericDto} from '../../zf-generic/zfgeneric-dto';
import {TransgeneDto} from '../../transgene-manager/transgene-dto';
import {MutationDto} from '../../mutation-manager/mutation-dto';

// TODO perhaps at some point we can add the researcher to this object.
export class StockDto extends ZfGenericDto {
  number: number = null;
  subNumber: number = null;
  description: string = null;
  fertilizationDate: string = null;
  matIdInternal: number = null;
  externalMatId: string = null;
  externalMatDescription: string = null;
  patIdInternal: number = null;
  externalPatId: string = null;
  externalPatDescription: string = null;
  comment: string = null;
  countEnteringNursery: number = null;
  countLeavingNursery: number = null;
  transgenes: TransgeneDto[] = [];
  mutations: MutationDto[] = [];
  alleleSummary: string = null;

  constructor() {
    super();
  }

  get internalLinkLabel(): string {
    return this.name;
  }

  get title(): string {
    return this.description;
  }

  get details(): string[] {
    let details = [];
    details.push(this.alleleSummary)
    if (this.comment) {
      details.push(this.comment);
    }
    return details;
  }
}


