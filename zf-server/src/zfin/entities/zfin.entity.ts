/**
 * Whenever you get an object back from the ZFIN API, it always has the fields
 * "class" and "objectId" whether you ask for them or not.
 *
 * We exclude both of these when transforming to plain objects because the client
 * simply does not need to see them.
 */
import {Exclude} from 'class-transformer';

export class Zfin {
  @Exclude()
  class: string;
  @Exclude()
  objectId: number;
}

export class ZfinSearchResult {
  message = '';
  searchConfidence: ZfinSearchConfidence = ZfinSearchConfidence.NONE;
}

export enum ZfinSearchConfidence {
  BAD_TOKEN,
  NONE,
  AMBIGUOUS,
  HALF,
  POSSIBLE,
  PROBABLE,
  EXACT,
}
