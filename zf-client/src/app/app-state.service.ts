import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {LOCAL_STORAGE, StorageService} from 'angular-webstorage-service';
import {LoaderService, ZFTypes} from "./loader.service";
import {AccessTokenPayload} from "./common/auth/zfm-access-token-payload";
import {plainToClass} from "class-transformer";

// Typescript does not allow enums with values as objects.
// The following is a clever workaround from the internet...
export class ZFTool {
  static readonly SPLASH_LOGIN  = new ZFTool(
    'login',
    ZFTypes.LOGIN,
    'Zebrafish Facility Manager');
  static readonly STOCK_MANAGER  = new ZFTool(
    'stock_manager',
    ZFTypes.STOCK,
    'Stock Manager');
  static readonly MUTATION_MANAGER = new ZFTool(
    'mutation_manager',
    ZFTypes.MUTATION,
    'Mutation Manager');
  static readonly TRANSGENE_MANAGER  = new ZFTool(
    'transgene_manager',
    ZFTypes.TRANSGENE,
    'Transgene Manager');

  // private to disallow creating other instances than the static ones above.
  private constructor(
    public readonly route: string,
    public readonly type: ZFTypes,
    public readonly display_name: any,
    ) {
  }

  // If you talk about a particular tool without specifying an attribute, you get it's route.
  toString() {
    return this.route;
  }
}

export enum ZFStates {
  FILTER = '_filter',
  SELECTED_ID = '_selected_id',
  ACTIVE_TOOL= 'active_tool'
}

@Injectable({
  providedIn: 'root'
})

export class AppStateService {
  private _activeTool$: BehaviorSubject<ZFTool> = new BehaviorSubject<ZFTool>(ZFTool.SPLASH_LOGIN);
  public get activeTool$() { return this._activeTool$; }
  public get activeTool() { return this.activeTool$.value; }

  private _accessToken: string;
  get accessToken(): string { return this._accessToken; }
  set accessToken(value: string) { this._accessToken = value; }


  constructor(
    public loader: LoaderService,
    @Inject(LOCAL_STORAGE) private localStorage: StorageService,
  ) {}

  // The default URI (after login) should be wherever the user was last.
  // Failing that, it should be the Stock Manager in view mode.
  // Note: we do not set the active tool here.  We just give a URI and
  // if that results in a navigation to this URI, the tool that we navigate to
  // will then set the active tool.
  getDefaultURI(): string {
    let tool: ZFTool = this.localStorage.get(ZFStates.ACTIVE_TOOL) as ZFTool;
    if (!tool || tool.route === ZFTool.SPLASH_LOGIN.route) { tool = ZFTool.STOCK_MANAGER; }
    let uri: string = '/' + tool.route;
    // check to see if there is a particular object that we should be viewing.
    const selected_id = this.getState(tool.type, ZFStates.SELECTED_ID);
    if (selected_id) {
      uri = uri + '/view/' + selected_id;
    }
    return uri;
  }
  setActiveTool(tool: ZFTool) {
    this.localStorage.set(ZFStates.ACTIVE_TOOL, tool);
    this._activeTool$.next(tool);
  }

  setState(type: ZFTypes, state: ZFStates, value: any) {
    this.localStorage.set(type + state, value);
  }
  getState(type: ZFTypes, state: ZFStates): any {
    return this.localStorage.get(type + state);
  }
  removeState(type: ZFTypes, state: ZFStates): any {
    return this.localStorage.remove(type + state);
  }

  // this decodes the access token and stuffs it in typed object.
  getAccessTokenPayload(): AccessTokenPayload {
    return plainToClass(AccessTokenPayload, JSON.parse(atob(this._accessToken.split('.')[1])));
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken);
  }

}
