import {ZfGenericDto} from '../zf-generic/zfgeneric-dto';

export class TransgeneDto extends ZfGenericDto {
  allele: string = null;
  descriptor: string = null;
  comment: string = null;
  // id: number = null; // from generic
  isDeletable = false;
  plasmid: string = null;
  source: string = null;
  serialNumber: number = null;
}
