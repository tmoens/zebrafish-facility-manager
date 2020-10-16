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

  constructor() {
    super();
  }

  get title(): string {
    return this.fullName;
  }

  get details(): string[] {
    let details = [];
    if (this.plasmid) {
      details.push('plasmid: ' + this.plasmid)
    }
    if (this.comment) {
      details.push(this.comment);
    }
    return details;
  }

  get hasExternalLink(): boolean {
    return !!this.zfinURL;

  }

  get externalLinkLabel(): string {
    if (this.zfinURL) {
      return "ZFIN";
    }
    return null;
  }

  get externalLinkURL(): string {
    if (this.zfinURL) {
      return this.zfinURL;
    }
    return null;
  }
}
