import {ZfGenericClass} from '../zf-generic/zfgeneric-class';
import {computed, observable} from 'mobx';
import {Mutation} from '../mutation-manager/mutation';
import {Transgene} from '../transgene-manager/transgene';

export class Stock extends ZfGenericClass {
  // id: number = null; // from generic
  name: string = null;
  number: number = null;
  subNumber: number = null;
  description: string = null;
  fertilizationDate: string = null;
  pi: string = null;
  researcher: string = null;
  background: number = null;
  matIdInternal: number = null;
  externalMatId: string = null;
  externalMatDescription: string = null;
  patIdInternal: number = null;
  externalPatId: string = null;
  externalPatDescription: string = null;
  comment: string = null;
  offspringCount: number = null;
  nextSubStockNumber: number = null;
  transgenes: Transgene[] = [];
  mutations: Mutation[] = [];


  // public constructor( init?: Partial<Stock>) {
  public constructor( ) {
    super();
    // Object.assign(this, init);
  }

  @computed get tooltip(): string {
    const strings: string[] = [];
    if (this.researcher) {
      strings.push('researcher: ' + this.researcher);
    }
    if (this.fertilizationDate) {
      strings.push('fertilized: ' + this.fertilizationDate);
    }
    if (this.comment) {
      strings.push('comment: ' + this.comment);
    }
    // this is how we get linebreaks in the text.
    // BUT you have to create a global style (.ttnl) to see the linebreaks and then
    // assign that style to tooltips (matTooltipClass="ttnl")
    return strings.join('\n');
  }

  hasTransgene(id: number): boolean {
    return this.transgenes.some(tg => tg.id === id);
  }

  hasMutation(id: number): boolean {
    return this.mutations.some(tg => tg.id === id);
  }
}


