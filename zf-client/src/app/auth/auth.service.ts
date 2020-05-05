import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, interval} from 'rxjs';
import {Router} from '@angular/router';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {plainToClass} from 'class-transformer';
import {AccessTokenPayload} from "./zfm-access-token-payload";
import {AppStateService} from "../app-state.service";
import {ZFTool} from "../helpers/zf-tool";
import {AppRoles} from "./app-roles";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public intendedPath: string;

  public loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // This is used in case the GUI needs to know if the user has been authenticated, i.e. logged in.
  get isAuthenticated(): boolean { return this.loggedIn$.value; }

  private accessToken$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  get accessToken(): string { return this.accessToken$.value; }

  private tokenPayload: AccessTokenPayload = null;

  // other state information is just held in an indexed array
  constructor(
    private appState: AppStateService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private localStorage: StorageService,
  ) { }


  initialize() {
    // tight loop, every 60 seconds check if the access token has expired and if so,
    // redirect to home page. Prevents the user from trying something and then finding out that
    // their session has effectively timed out.
    const checkExpiry = interval(60000);
    checkExpiry.subscribe(_ => {
      if (this.isAuthenticated && this.isTokenExpired(this.accessToken)) {
        this.accessToken$.next(null);
        this.router.navigateByUrl(ZFTool.SPLASH_LOGIN.route);
      }
    });

    // On startup, use the token from local storage token (if there is one) as the access token.
    this.accessToken$.next(this.localStorage.get('access_token'));

    // Whenever the access token changes, do some work
    this.accessToken$.subscribe(
      (token: string) => {

        // wipe the cached token payload.
        this.tokenPayload = null;

        // Put a copy of the new token in local storage.
        this.localStorage.set('access_token', token);

        if (!token) {

          // if there was no token, broadcast the fact that the user has logged out.
          this.loggedIn$.next(false);
        } else if (this.isTokenExpired(token)) {

          // if the token is expired, (this could happen when a session is restarted and an
          // expired token is read from local storage) set it to null, effectively logging the user out.
          this.accessToken$.next(null);
        } else if (this.decryptToken(token).passwordChangeRequired) {

          // If the user is supposed to change their password, force that.
          this.router.navigateByUrl('change-password');
        } else {

          // well, finally this looks like a good access token, so mark the user as logged in
          // and cache the token payload.
          this.loggedIn$.next(true);
          this.tokenPayload = this.decryptToken(token);
          this.router.navigateByUrl(this.getDefaultURI());
        }
      });
  }

  onLogin(token) {
    this.accessToken$.next(token);
  }

  onLogout() {
    this.accessToken$.next(null);
  }

  onLoginFailed() {
    this.onLogout();
  }

  // The default URI (after login) should be
  // a) whatever the intend path was when the user was forced to login.  This supports
  // one user sending another an interesting url.
  // b) wherever the user was when they were last logged in (as figured out from local storage)
  // c) failing that, the Stock Manager in view mode.
  // TODO deal with the user having been in edit mode when logged out.
  getDefaultURI(): string {
    if (this.intendedPath) {
      const p = this.intendedPath;
      this.intendedPath = null;
      return p;
    }
    return 'stock_manager/view';
  }

  // this decodes the access token and stuffs it in typed object.
  decryptToken(token): AccessTokenPayload {
    if (token) {
      return plainToClass(AccessTokenPayload, JSON.parse(atob(token.split('.')[1])));
    } else {
      return null;
    }
  }

  // find out if the token will expire within the next 65 seconds.
  isTokenExpired(token): boolean {
    const tokenPayload: AccessTokenPayload = this.decryptToken(token);
    if (tokenPayload && tokenPayload.exp) {
      const d = new Date(0);
      d.setUTCSeconds(tokenPayload.exp);
      if (d.valueOf() > new Date().valueOf() + 65000) {
        // not expired
        return false;
      } else {
        // expired
        return true;
      }
    } else {
      // no token or no token expiry - deemed expired
      return true;
    }
  }

  // Check if the logged in user is allowed to perform a particular role.
  canPerformRole(roleInQuestion: string): boolean {
    if (!this.isAuthenticated) {
      return false;
    } else {
      return AppRoles.isAuthorized(this.decryptToken(this.accessToken).role, roleInQuestion);
    }
  }

  getLoggedInUserName(): string {
    return (this.isAuthenticated) ? this.tokenPayload.username : null;
  }

  loggedInUserId(): string {
    return (this.isAuthenticated) ? this.tokenPayload.sub : null;
  }
}
