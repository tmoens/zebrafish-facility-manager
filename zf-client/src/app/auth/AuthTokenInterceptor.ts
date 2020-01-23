/**
 * This just intercepts the outbound http requests and inserts the jwt
 * More efficient than doing it in every single http request.
 *
 * Note that because the configService runs before app initialization,
 * it's HTTP requests are *not* intercepted and do not therefore have
 * a bearer token. This is fully intended.
 *
 */
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable, from, throwError} from 'rxjs';
import {AuthService} from "./auth.service";
import {catchError, mergeMap} from "rxjs/operators";
@Injectable({
  providedIn: 'root',
})
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor( private auth: AuthService ) {}
  intercept(request: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    return this.auth.getTokenSilently$().pipe(
      mergeMap(token => {
        const tokenReq = request.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(tokenReq);
      }),
      catchError(err => throwError(err))
    );
  }
}
