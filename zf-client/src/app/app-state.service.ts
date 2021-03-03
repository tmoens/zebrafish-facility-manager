import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {ZFTool} from './helpers/zf-tool';
import {Router} from '@angular/router';
import {ZFTypes} from './helpers/zf-types';
import {ScreenSizes} from './helpers/screen-sizes';
import {ClientConfig} from './common/config/client-config';

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
  // We store the facility configuration info here when we get it.
  facilityConfig: ClientConfig;

  // for storing arbitrary state data and arbitrary state data that persists over restarts
  state: { [name: string]: any } = {};
  persistentState: { [name: string]: any } = {};
  selectorFixed: boolean = true;
  screenSize: ScreenSizes = ScreenSizes.LARGE;

  private _activeTool$: BehaviorSubject<ZFTool> = new BehaviorSubject<ZFTool>(ZFTool.SPLASH_LOGIN);
  private get activeTool$() {
    return this._activeTool$;
  }

  public get activeTool() {
    return this.activeTool$.value;
  }

  // other state information is just held in an indexed array
  constructor(
    private router: Router,
    @Inject(LOCAL_STORAGE) private localStorage: StorageService,
  ) {
  }

  // The services refresh their data every hour or so (by default).  There is a random
  // stagger of 20 to 70 seconds so that all the services don't refresh simultaneously.
  // This should probably be a configuration constant, but anyway.
  // Even better, we could do this with "push notifications" from the server
  // and a much better approach to caching in the services.  But it suffices
  // and is not too data intensive.
  get backgroundDataRefreshInterval(): number {
    let d = this.getState('backgroundDataRefresh') || 3600000;
    return d + Math.floor(Math.random() * 50000 + 20000);
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

  // For future use, services can potentially set a service specific cache refresh rate.
  set backgroundDataRefresh(ms: number) {
    if (ms < 0) {
      this.deleteState('backgroundDataRefresh');
    } else {
      this.setState('backgroundDataRefresh', ms, true);
    }
  }

  initialize() {
    // load up the persistentState
    if (this.localStorage.get('persistentState')) {
      this.persistentState = this.localStorage.get('persistentState');
    }
  }

  get errorMessageDuration(): number {
    const d = this.getState('errorMessageDuration');
    return d ? d : 4000;
  }
}
