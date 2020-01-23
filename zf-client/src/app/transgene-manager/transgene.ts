import {ZfGenericClass} from '../zf-generic/zfgeneric-class';
import {computed, observable} from 'mobx';

export class Transgene extends ZfGenericClass {
  @observable allele: string = null;
  @observable descriptor: string = null;
  comment: string = null;
  // id: number = null;
  @observable plasmid: string = null;
  @observable source: string = null;
  serialNumber: number = null;

  public constructor( init?: Partial<Transgene>) {
    super();
    Object.assign(this, init);
  }

  public get name(): string {
    return this.allele + ': ' + this.descriptor;
  }

  @computed get fullName(): string {
   const name: string[] = [];
    if (this.allele) { name.push(this.allele); }
    if (this.descriptor) { name.push(this.descriptor); }
    return name.join(': ');
  }

  @computed get tooltip(): string {
    const strings: string[] = [];
    if (this.source) {
      strings.push('source: ' + this.source);
    }
    if (this.plasmid) {
      strings.push('plasmid: ' + this.plasmid);
    }
    if (this.comment) {
      strings.push('comment: ' + this.comment);
    }
    // this is how we get linebreaks in the text.
    // BUT you have to create a global style (.ttnl) to see the linebreaks and then
    // assign that style to tooltips (matTooltipClass="ttnl")
    return strings.join('\n');
  }

  containsString(searchString: string): boolean {
    const s = searchString.toLowerCase();
    if (this.allele && this.allele.toLowerCase().includes(s)) { return true; }
    if (this.descriptor && this.descriptor.toLowerCase().includes(s)) { return true; }
    if (this.comment && this.comment.toLowerCase().includes(s)) { return true; }
    if (this.plasmid && this.plasmid.toLowerCase().includes(s)) { return true; }
    return this.source && this.source.toLowerCase().includes(s);

  }

}
