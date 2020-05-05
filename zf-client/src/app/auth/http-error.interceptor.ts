import {Injectable} from "@angular/core";
import {AppStateService} from "../app-state.service";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "./auth.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private appState: AppStateService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.snackBar.open(err.error.message || err.statusText, null,
            {duration: this.appState.errorMessageDuration});
          if (err.status === 401) {
            // auto logout if 401 response returned from api
            console.log("401");
            this.authService.onLogout();
          }
          const error = err.error.message || err.statusText;
          return throwError(error);
        }))
  }
}

