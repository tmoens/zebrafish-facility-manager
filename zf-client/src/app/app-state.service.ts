import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, interval} from 'rxjs';
import {AccessTokenPayload} from "./common/auth/zfm-access-token-payload";
import {plainToClass} from "class-transformer";
import {LOCAL_STORAGE, StorageService} from "ngx-webstorage-service";
import {ZFTool} from "./helpers/zf-tool";
import {Router} from "@angular/router";
import {ZFRoles} from "./common/auth/zf-roles";
import {ZFTypes} from "./helpers/zf-types";

/**
 * This maintains the state of the application.  It does a few main things.
 * 1) manages the Access Token and through that, it effectively manages the login state of the user.
 * 2) keeps configuration information about the facility being managed.  The user can override some
 *    of that through the GUI.
 * 3) keeps some data in local storage for reuse over restarts.
 */
export enum ZFToolStates {
  FILTER = '_filter',
  SELECTED_ID = '_selected_id',
  ACTIVE_TOOL= 'active_tool'
}

@Injectable({
  providedIn: 'root'
})

export class AppStateService {
  // for storing arbitrary state data and arbitrary state data that persists over restarts
  state: {[name: string]: any } = {};
  persistentState: {[name: string]: any } = {};

  private _loggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // Some services watch until the user is logged in, at which point they can load data from the server.
  get loggedIn$(): BehaviorSubject<boolean> { return this._loggedIn$; }
  // This is used in case the GUI needs to know if the user has been authenticated, i.e. logged in.
  get isAuthenticated(): boolean {return this.loggedIn$.value;}

  private _activeTool$: BehaviorSubject<ZFTool> = new BehaviorSubject<ZFTool>(ZFTool.SPLASH_LOGIN);
  private get activeTool$() { return this._activeTool$; }
  public get activeTool() { return this.activeTool$.value; }

  private _accessToken$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private get accessToken$(): BehaviorSubject<string> { return this._accessToken$; }
  public get accessToken(): string { return this._accessToken$.value; }

  // The "intendedPath" the the path the user was trying to navigate to when sent to
  // login or change password.  After the login or password change is complete, it gets
  // fetched and navigated to.
  private _intendedPath: string = null;
  get intendedPath() {
    return this._intendedPath;
  }

  set intendedPath(path: string) {
    this._intendedPath = path;
  }

  // other state information is just held in an indexed array
  constructor(
    private router: Router,
    @Inject(LOCAL_STORAGE) private localStorage: StorageService,
  ) {
  }

  // we introduce a random stagger of 2 to 7 seconds so that all the services don;t refresh simultaneously
  get backgroundDataRefreshInterval(): number {
    let d = this.getState('backgroundDataRefresh') || 300000;
    return d + Math.floor(Math.random() * 5000 + 2000);
  }

  onLogin(token) {
    this.accessToken$.next(token);
  }

  onLoginFailed() {
    this.onLogout()
  }

  onLogout() {
    this.accessToken$.next(null);
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

  // These next few are used to remember where the user was over restarts
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

  // Check if the logged in user is allowed to perform a particular role.
  canPerformRole(roleInQuestion: string): boolean {
    if (!this.isAuthenticated) {
      return false;
    }
    return ZFRoles.isAuthorized(this.getAccessTokenPayload(this.accessToken).role, roleInQuestion)
  }

  setState(name: string, value: any, persist: boolean = false) {
    if (persist) {
      this.persistentState[name] = value;
    } else {
      this.state[name] = value;
    }
  }

  deleteState(name:string) {
    if (this.persistentState[name]) { delete this.persistentState[name]; }
    if (this.state[name]) { delete this.state[name]; }
  }

  getState(name): any {
    if (this.persistentState[name]) { return this.persistentState[name]; }
    if (this.state[name]) { return this.state[name]; }
    return null;
  }

  // making room to allow the user to set this value as as an option.
  set confirmMessageDuration(ms: number) {
    if (ms < 0) {
      this.deleteState('confirmMessageDuration');
    } else {
      this.setState('confirmMessageDuration', ms, true);
    }
  }

  get confirmMessageDuration(): number {
    const d = this.getState('confirmMessageDuration');
    return d ? d : 2000;
  }

  set errorMessageDuration(ms: number) {
    if (ms < 0) {
      this.deleteState('errorMessageDuration');
    } else {
      this.setState('errorMessageDuration', ms, true);
    }
  }

  set backgroundDataRefresh(ms: number) {
    if (ms < 0) {
      this.deleteState('backgroundDataRefresh');
    } else {
      this.setState('backgroundDataRefresh', ms, true);
    }
  }

  initialize() {
    // tight loop, every 5 seconds check if the access token has expired and if so,
    // redirect to login page. Prevents the user from trying something and then finding out that
    // their session has effectively timed out.
    const checkExpiry = interval(5000);
    checkExpiry.subscribe(_ => {
      if (this.isAuthenticated && this.isTokenExpired(this.accessToken)) {
        this.router.navigateByUrl('/login');
      }
    });

    // On startup, use the token from local storage token (if there is one) as the access token.
    this.accessToken$.next(this.localStorage.get('access_token'));

    // load up the persistentState
    if (this.localStorage.get('persistentState')) {
      this.persistentState = this.localStorage.get('persistentState');
    }

    // Whenever the access token changes, do some work
    this.accessToken$.subscribe(
      (token: string) => {
        // Put a copy in local storage.
        this.localStorage.set('access_token', token);
        if (!token) {
          // if there is no token, clear whatever was in local storage and broadcast the fact
          // that the user has logged out.
          this.loggedIn$.next(false);
        } else if (this.isTokenExpired(token)) {
          // if the token is expired, (this could happen when a session is restarted and the token is read
          // from local storage) reset it to null, effectively logging the user out.
          this.accessToken$.next(null);
        } else if (this.getAccessTokenPayload(token).passwordChangeRequired) {
          // If the user is meant to change their password, force that.
          this.router.navigateByUrl('/change-password');
        } else {
          // well, finally this looks like a good access token, so mark the user as logged in
          // and then navigate to wherever we were meant to navigate to.
          this.loggedIn$.next(true);
          this.router.navigateByUrl(this.getDefaultURI());
        }
      });
  }

  get errorMessageDuration(): number {
    const d = this.getState('errorMessageDuration');
    return d ? d : 4000;
  }

  getLoggedInUserName(): string {
    return (this.isAuthenticated) ? this.getAccessTokenPayload(this.accessToken).username : null;
  }

  loggedInUserId(): string {
    return (this.isAuthenticated) ? this.getAccessTokenPayload(this.accessToken).sub : null;
  }


}
