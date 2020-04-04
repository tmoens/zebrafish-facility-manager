import {Injectable} from "@angular/core";
import {AppStateService} from "../app-state.service";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private appStateService: AppStateService,
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError(err => {
          if (err.status === 401) {
            // auto logout if 401 response returned from api
            console.log("401");
            this.appStateService.onLogout();
          }

          const error = err.error.message || err.statusText;
          return throwError(error);
        }))
  }
}

