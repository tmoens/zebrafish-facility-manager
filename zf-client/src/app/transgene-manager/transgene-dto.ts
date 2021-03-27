import {ZfGenericDto} from '../zf-generic/zfgeneric-dto';
import {ZFIN_URL_PREFIX} from '../common/zfin/zfin-url';

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
  zfinId: string = null;

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
    return !!this.zfinId;

  }

  get externalLinkLabel(): string {
    if (this.hasExternalLink) {
      return "ZFIN";
    }
    return null;
  }

  get externalLinkURL(): string {
    if (this.hasExternalLink) {
      return ZFIN_URL_PREFIX + this.zfinId;
    }
    return null;
  }
}
