import {Directive, forwardRef, Injectable} from '@angular/core';
import {AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors} from '@angular/forms';
import {StockService} from '../stock.service';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Directive({
  selector: '[stockNameCheck][ngModel]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => StockNameCheckValidator),
      multi: true
    },
  ]
})

export class StockNameCheckValidator implements AsyncValidator {
  constructor(private stockService: StockService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.stockService.getByName(ctrl.value).pipe(
      map(stock => (stock ? null : { noSuchStock: 'No such stock' } )),
      catchError(() => null)
    );
  }
}
