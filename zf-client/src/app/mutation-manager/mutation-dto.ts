import {ZfGenericDto} from "../zf-generic/zfgeneric-dto";

export class MutationDto extends ZfGenericDto {
  alternateGeneName: string = null;
  aaChange: string = null;
  actgChange: string = null;
  comment: string = null;
  gene: string = null;
  isDeletable = false;
  mutationType: string = null;
  morphantPhenotype: string = null;
  nickname: string = null;
  phenotype: string = null;
  researcher: string = null;
  screenType: string = null;
  spermFreezePlan: string = null;
  serialNumber: number = null;
  thawDate: Date = null;
  tillingMaleNumber: number = null;
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
