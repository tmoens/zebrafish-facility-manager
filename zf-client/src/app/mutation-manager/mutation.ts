import {computed, observable} from 'mobx';
import {ZfGenericClass} from '../zf-generic/zfgeneric-class';

export class Mutation extends ZfGenericClass {
  @observable alternateGeneName: string = null;
  aaChange: string = null;
  actgChange: string = null;
  @observable comment: string = null;
  @observable gene: string = null;
  // id: number = null;
  isDeletable = false;
  mutationType: string = null;
  @observable morphantPhenotype: string = null;
  @observable name: string = null;
  @observable phenotype: string = null;
  @observable researcher: string = null;
  screenType: string = null;
  spermFreezePlan: string = null;
  serialNumber: number = null;
  thawDate: Date = null;
  tillingMaleNumber: number = null;
  vialsFrozen: number = null;

  public constructor( init?: Partial<Mutation>) {
    super();
    Object.assign(this, init);
  }

  // This just makes a string that can be used as a tooltip when
  // hovering over a mutation
  @computed get tooltip(): string {
    const strings: string[] = [];
    if (this.alternateGeneName) {
      strings.push('alt gene name: ' + this.alternateGeneName);
    }
    if (this.researcher) {
      strings.push('researcher: ' + this.researcher);
    }
    if (this.phenotype) {
      strings.push('phenotype: ' + this.phenotype.substr(0, 50));
    }
    if (this.morphantPhenotype) {
      strings.push('morphant phenotype: ' + this.morphantPhenotype.substr(0, 50));
    }
    if (this.comment) {
      strings.push('comment: ' + this.comment.substr(0, 50));
    }
    // this is how we get linebreaks in the text.
    // BUT you have to create a global style (.ttnl) to see the linebreaks and then
    // assign that style to tooltips (matTooltipClass="ttnl")
    return strings.join('\n');
  }

  @computed get fullName(): string {
    return this.gene + ': ' + this.name;
  }

  containsString(searchString: string): boolean {
    const s = searchString.toLowerCase();
    if (this.name && this.name.toLowerCase().includes(s)) { return true; }
    if (this.gene && this.gene.toLowerCase().includes(s)) { return true; }
    if (this.comment && this.comment.toLowerCase().includes(s)) { return true; }
    if (this.phenotype && this.phenotype.toLowerCase().includes(s)) { return true; }
    if (this.morphantPhenotype && this.morphantPhenotype.toLowerCase().includes(s)) { return true; }
    return false;
  }
}
