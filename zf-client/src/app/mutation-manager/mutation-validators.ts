import {Injectable} from '@angular/core';
import {AbstractControl, ValidationErrors, Validator} from '@angular/forms';
import {MutationService} from './mutation.service';

@Injectable({ providedIn: 'root' })
export class MutationValidators {
  constructor(
    private mutationService: MutationService,
  ) {}

  uniqueName(control: AbstractControl): ValidationErrors | null {
    if (this.mutationService.nameIsInUse(control.value)) {
      return {'unique': {value: control.value}};
    } else {
      return null;
    }
  }
}
