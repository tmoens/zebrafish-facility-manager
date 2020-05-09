import {Injectable} from "@angular/core";
import {AbstractControl, AsyncValidator, ValidationErrors} from "@angular/forms";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AuthApiService} from "../auth-api.service";

@Injectable({providedIn: 'root'})
export class UniqueEmailValidator implements AsyncValidator {
  constructor(
    private authApi: AuthApiService,
  ) {
  }

  validate(ctrl: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.authApi.isEmailInUse(ctrl.value)
      .pipe(
        map(isInUse => (isInUse ? {uniqueEmail: true} : null))
      );
  }
}
