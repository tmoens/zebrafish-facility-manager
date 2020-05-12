import {ZfGenericDto} from '../zf-generic/zfgeneric-dto';

export class TransgeneDto extends ZfGenericDto {
  allele: string = null;
  descriptor: string = null;
  nickname: string = null;
  comment: string = null;
  plasmid: string = null;
  source: string = null;
  serialNumber: number = null;
}
