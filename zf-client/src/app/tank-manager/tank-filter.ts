import {ZfGenericFilter} from '../zf-generic/zfgeneric-filter';

export class TankFilter extends ZfGenericFilter {
  text: string = null;

  public constructor( init?: Partial<TankFilter>) {
    super();
    Object.assign(this, init);
  }

  isEmpty(): boolean {
    return !(this.text);
  }

}
