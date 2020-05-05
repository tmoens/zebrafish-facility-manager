import {ZfGenericFilter} from '../../zf-generic/zfgeneric-filter';

export class UserFilter extends ZfGenericFilter {
  filter: string = null;

  public constructor( init?: Partial<UserFilter>) {
    super();
    Object.assign(this, init);
  }

  isEmpty(): boolean {
    return !(this.filter);
  }

}
