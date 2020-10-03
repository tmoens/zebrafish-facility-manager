import {ZfGenericDto} from '../zf-generic/zfgeneric-dto';

export class TransgeneDto extends ZfGenericDto {
  allele: string = null;
  comment: string = null;
  descriptor: string = null;
  nickname: string = null;
  plasmid: string = null;
  serialNumber: number = null;
  source: string = null;
  spermFreezePlan: string = null;
  vialsFrozen: number = null;
  zfinURL: string = null;
}
