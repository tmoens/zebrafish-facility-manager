import {ZfGenericClass} from '../zf-generic/zfgeneric-class';

export class Tank extends ZfGenericClass {
  // id: number = null;
  comment?: string;
  name: string;
  rack?: string;
  shelf?: string;
  slot?: string;

  public constructor( init?: Partial<Tank>) {
    super();
    Object.assign(this, init);
  }

  containsString(searchString: string): boolean {
    return false;
  }

}
