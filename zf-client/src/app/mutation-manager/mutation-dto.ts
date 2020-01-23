import {ZfGenericDto} from '../zf-generic/zfgeneric-dto';

export class MutationDto extends ZfGenericDto {
  alternateGeneName: string = null;
  aaChange: string = null;
  actgChange: string = null;
  comment: string = null;
  gene: string = null;
  // id: number = null; // from generic
  isDeletable = false;
  mutationType: string = null;
  morphantPhenotype: string = null;
  name: string = null;
  phenotype: string = null;
  researcher: string = null;
  screenType: string = null;
  spermFreezePlan: string = null;
  serialNumber: number = null;
  thawDate: Date = null;
  tillingMaleNumber: number = null;
  vialsFrozen: number = null;
}
