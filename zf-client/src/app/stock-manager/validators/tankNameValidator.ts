import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';
import {TankService} from '../../tank-manager/tank.service';
import {Directive, forwardRef, Injectable} from '@angular/core';

/**
 * This is a tank name validator.  It is synchronous because the tankService caches all of the valid tank
 * names.  However, it *does* require access to the tankService and so it is not implemented as a simple
 * validation function (which can operate in a context free manner).  Instead we implement it as a Validator
 * Class and supply the "validate function".
 *
 * Also, I could not use it when configuring a reactive FormControl's second argument (a list of validators)
 * only accepts validator functions and not a Validator class like this one. So we had to make it a directive
 * (validateTankName) and stick that directive in the HTML in the FormControl where the user enters a tank
 * name.
 *
 * I used Pascal Pecht's article to figure out how to do all of this.
 * https://blog.thoughtram.io/angular/2016/03/14/custom-validators-in-angular-2.html
 */

@Directive({
  selector: '[validateTankName]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => TankNameValidator), multi: true }
  ]
})

export class TankNameValidator implements Validator {
  constructor(private tankService: TankService) {}

  validate( control: AbstractControl): ValidationErrors | null {
    // treat an empty tank name as a valid name.
    if (control.value === null) { return null; }
    if (this.tankService.isValidName(control.value)) {
      return null;
    } else {
      return {invalidTankName: 'Invalid tank name.'};
    }
  }
}
