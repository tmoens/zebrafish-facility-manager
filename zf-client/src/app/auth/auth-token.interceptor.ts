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
import { Observable, from } from 'rxjs';
import {AppStateService} from "../app-state.service";

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(
    private appStateService: AppStateService,
    ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    if (this.appStateService.accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.appStateService.accessToken,
        }
      });
    } else {
      // console.log("No token for url: " + request.url);
    }
    return next.handle(request).toPromise();
  }
}
