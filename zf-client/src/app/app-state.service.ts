import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {LoaderService, ZFTypes} from "./loader.service";
import {AccessTokenPayload} from "./common/auth/zfm-access-token-payload";
import {plainToClass} from "class-transformer";
import {LOCAL_STORAGE, StorageService} from "ngx-webstorage-service";
import {ZFTool} from "./helpers/zf-tool";
import {Route, Router} from "@angular/router";
import {ZFRoles} from "./common/auth/zf-roles";


export enum ZFToolStates {
  FILTER = '_filter',
  SELECTED_ID = '_selected_id',
  ACTIVE_TOOL= 'active_tool'
}

@Injectable({
  providedIn: 'root'
})

export class AppStateService {
  private _loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  get loggedIn$(): BehaviorSubject<boolean> {
    return this._loggedIn$;
  }
  get isAuthenticated(): boolean {
    return this.loggedIn$.value;
  }
  private _activeTool$: BehaviorSubject<ZFTool> = new BehaviorSubject<ZFTool>(ZFTool.SPLASH_LOGIN);
  public get activeTool$() { return this._activeTool$; }
  public get activeTool() { return this.activeTool$.value; }

  private _accessToken$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  get accessToken$(): BehaviorSubject<string> {
    return this._accessToken$;
  }
  public get accessToken(): string {
    return this._accessToken$.value;
  }

  private _intendedPath: string = null;
  get intendedPath() { return this._intendedPath; }
  set intendedPath(path: string) { this._intendedPath = path; }

  constructor(
    public loader: LoaderService,
    private router: Router,
    @Inject(LOCAL_STORAGE) private localStorage: StorageService,
  ) {
    // Use the stored token (if there is one) as the access token.
    // if it is invalid or outdated, that will be dealt with elsewhere.
    this.accessToken$.next(this.localStorage.get('access_token'));
    this.accessToken$.subscribe(
      (token: string) => {
        if (!token) {
          this.loggedIn$.next(false);
        } else if (this.isTokenExpired(token)) {
          this.onLogout();
        } else if(this.getAccessTokenPayload(token).passwordChangeRequired) {
          // If the user is meant to change their password, force that.
          this.router.navigateByUrl('/change-password');
        } else {
          this.loggedIn$.next(true);
          this.router.navigateByUrl(this.getDefaultURI());
        }
      });
  }

  onLogin(token) {
    this.localStorage.set('access_token', token);
    this.accessToken$.next(token);
  }

  onLoginFailed() {
    this.onLogout()
  }

  onLogout() {
    this.localStorage.remove('access_token');
    this.accessToken$.next(null);
  }

  isPasswordChangeRequired():boolean {
    return !!(this.getAccessTokenPayload(this.accessToken).passwordChangeRequired);
  }

  // The default URI (after login) should be
  // a) whatever the intend path was when she was forced to login.  This supports
  // one user sending another an interesting url.
  // b) wherever the user was when they were last logged in.
  // c)failing that, it should be the Stock Manager in view mode.
  getDefaultURI(): string {
    if (this.intendedPath) {
      const p = this.intendedPath;
      this.intendedPath = null;
      return p;
    }
    let tool: ZFTool = this.localStorage.get(ZFToolStates.ACTIVE_TOOL) as ZFTool;
    if (!tool || tool.route === ZFTool.SPLASH_LOGIN.route) { tool = ZFTool.STOCK_MANAGER; }
    let uri: string = '/' + tool.route;
    // check to see if there is a particular object that we should be viewing.
    const selected_id = this.getToolState(tool.type, ZFToolStates.SELECTED_ID);
    if (selected_id) {
      uri = uri + '/view/' + selected_id;
    }
    return uri;
  }

  setActiveTool(tool: ZFTool) {
    this.localStorage.set(ZFToolStates.ACTIVE_TOOL, tool);
    this._activeTool$.next(tool);
  }

  setToolState(type: ZFTypes, state: ZFToolStates, value: any) {
    this.localStorage.set(type + state, value);
  }
  getToolState(type: ZFTypes, state: ZFToolStates): any {
    return this.localStorage.get(type + state);
  }
  removeToolState(type: ZFTypes, state: ZFToolStates): any {
    return this.localStorage.remove(type + state);
  }

  // this decodes the access token and stuffs it in typed object.
  getAccessTokenPayload(token): AccessTokenPayload {
    if (token) {
      return plainToClass(AccessTokenPayload, JSON.parse(atob(token.split('.')[1])));
    } else {
      return null;
    }
  }

  // find out if the toke will expire within the next 5 seconds.
  isTokenExpired(token): boolean {
    const tokenPayload = this.getAccessTokenPayload(token);
    if (tokenPayload && tokenPayload.exp) {
      const d = new Date(0);
      d.setUTCSeconds(tokenPayload.exp);
      if (d.valueOf() > new Date().valueOf() + 5000) {
        // not expired
        return false;
      } else {
        return true;
      }
    } else {
      // no toke or no token expiry - deemed expired.
      return true;
    }
  }

  getUserRole(): string {
    if (!this.isAuthenticated) return null;
    return this.getAccessTokenPayload(this.accessToken).role;
  }

  canPerformRole(roleInQuestion: string): boolean {
    if (!this.isAuthenticated) {
      return false;
    }
    return ZFRoles.isAuthorized(this.getAccessTokenPayload(this.accessToken).role, roleInQuestion)
  }

}
