import {ZfGenericFilter} from '../zf-generic/zfgeneric-filter';

export class TransgeneFilter extends ZfGenericFilter {
  text: string = null;

  public constructor( init?: Partial<TransgeneFilter>) {
    super();
    Object.assign(this, init);
  }

  isEmpty(): boolean {
    return !(this.text);
  }

}
