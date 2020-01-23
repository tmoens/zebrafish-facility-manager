import {Injectable} from '@angular/core';
import {AbstractControl, ValidationErrors, Validator} from '@angular/forms';
import {StockService} from './stock.service';

@Injectable({ providedIn: 'root' })
export class TransgeneValidators {
  constructor(
    private mutationService: StockService,
  ) {}

  // TODO descriptor + allele needs to be unique.
}
