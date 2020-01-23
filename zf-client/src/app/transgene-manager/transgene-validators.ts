import {Injectable} from '@angular/core';
import {AbstractControl, ValidationErrors, Validator} from '@angular/forms';
import {TransgeneService} from './transgene.service';

@Injectable({ providedIn: 'root' })
export class TransgeneValidators {
  constructor(
    private mutationService: TransgeneService,
  ) {}

  // TODO descriptor + allele needs to be unique.
}
