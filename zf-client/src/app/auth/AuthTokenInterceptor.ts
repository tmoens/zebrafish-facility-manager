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

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    // only add tokens for requests heading to the zf-server
    // request = request.clone({
    //   setHeaders: {
    //     Authorization: 'Bearer ' + accessToken
    //   }
    // });
    return next.handle(request).toPromise();
  }
}
