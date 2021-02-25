import {Injectable} from '@angular/core';
import {TransgeneService} from './transgene.service';

@Injectable({ providedIn: 'root' })
export class TransgeneValidators {
  constructor(
    private transgeneService: TransgeneService,
  ) {}

  // TODO descriptor + allele needs to be unique.
}
