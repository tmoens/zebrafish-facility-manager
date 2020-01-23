import {ZfGenericFilter} from '../zf-generic/zfgeneric-filter';

export class MutationFilter extends ZfGenericFilter{
  gene: string = null;
  researcher: string = null;
  mutationType: string = null;
  screenType: string = null;
  spermFreeze: string = null;
  freeText: string = null;
  ownedMutationsOnly = false;

  public constructor( init?: Partial<MutationFilter>) {
    super();
    Object.assign(this, init);
  }

  isEmpty(): boolean {
    return !(
      this.gene || this.researcher || this.mutationType ||
      this.screenType || this.spermFreeze || this.freeText ||
      this.ownedMutationsOnly);
  }
}
