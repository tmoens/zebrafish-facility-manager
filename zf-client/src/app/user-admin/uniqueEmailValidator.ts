import {Injectable} from "@angular/core";
import {AbstractControl, AsyncValidator, ValidationErrors} from "@angular/forms";
import {LoaderService} from "../loader.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class UniqueEmailValidator implements AsyncValidator {
  constructor(
    private loader: LoaderService
  ) {
  }

  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.loader.isEmailInUse(ctrl.value)
      .pipe(
        map(isInUse => (isInUse ? {uniqueEmail: true} : null))
      );
  }
}
