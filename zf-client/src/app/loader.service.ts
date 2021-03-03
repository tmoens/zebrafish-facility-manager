import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError} from 'rxjs/operators';
import {environment} from '../environments/environment'
import {AppStateService} from './app-state.service';
import {ZFTypes} from './helpers/zf-types';
import {Router} from '@angular/router';
import {AuthService} from './auth/auth.service';
import {StockFullDto} from './stock-manager/dto/stock-full-dto';
import {ClientConfig} from './common/config/client-config';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  serverURL: string;

  constructor(
    private http: HttpClient,
    private message: MatSnackBar,
    private authService: AuthService,
    private appState: AppStateService,
    private router: Router,
  ) {
    if (environment.production) {
      this.serverURL = location.origin + '/zf-server';
    } else {
      this.serverURL = 'http://localhost:3005';
    }
  }

  // get client configuration from the server, if it fails return a default config object.
  getClientConfig(): Observable<any> {
    return this.http.get(this.serverURL + '/app/clientConfig')
      .pipe(
        catchError(this.handleError('Loading client configuration', new ClientConfig()))
      );
  }

  getFilteredList(type: ZFTypes, filter: any): Observable<any> {
    if (!filter) {
      filter = {};
    }
    const q = convertObjectToHTTPQueryParams(filter);
    return this.http.get(this.serverURL + '/' + type + q)
      .pipe(
        catchError(this.handleError('Get ' + type + '.', []))
      );
  }

  getReport(type: ZFTypes, filter: any): Observable<any> {
    if (!filter) {
      filter = {};
    }
    const q = convertObjectToHTTPQueryParams(filter);
    return this.http.get(this.serverURL + '/' + type + '/report/' + q)
      .pipe(
        catchError(this.handleError('get report ' + type + '.', []))
      );
  }

  getAuditReport(): Observable<any> {
    return this.http.get(this.serverURL + '/tank/auditReport/')
      .pipe(
        catchError(this.handleError('get audit report' + '.', []))
      );

  }

  getInstance(type: ZFTypes, id: any): Observable<any> {
    if (!id) {
      return of({});
    }
    return this.http.get(this.serverURL + '/' + type + '/' + id.toString())
      .pipe(
        catchError(this.handleError('Get ' + type + '.', {}))
      );
  }

  getByName(type: ZFTypes, name: string): Observable<any> {
    return this.http.get(this.serverURL + '/' + type + '/name/' + name)
      .pipe(
        catchError(this.handleError('Get ' + type + '.', null))
      );
  }

  delete(type: ZFTypes, id: number | string) {
    return this.http.delete(this.serverURL + '/' + type + '/' + id)
      .pipe(
        catchError(this.handleError('Delete ' + type + '.', null))
      );
  }

  // Swimmers are a bit different - they have two ids, the stock that is swimming
  // and the tank it is swimming in.  So it does not fit the generic delete operation
  deleteSwimmer(stockId: number, tankId: number) {
    return this.http.delete(this.serverURL + '/swimmer/' + stockId + '/' + tankId)
      .pipe(
        catchError(this.handleError('Delete swimmer failed' + '.', {}))
      );
  }

  create(type: ZFTypes, thing: any) {
    return this.http.post(this.serverURL + '/' + type + '/', thing)
      .pipe(
        catchError(this.handleError('Create ' + type + ' failed.', null))
      );
  }

  // just like create but ask to auto-create the name using the next sequential name.
  createNext(type: ZFTypes, m: any) {
    return this.http.post(this.serverURL + '/' + type + '/next', m)
      .pipe(
        catchError(this.handleError('Create Next ' + type + '.', null))
      );
  }

  update(type: ZFTypes, m: any) {
    return this.http.put(this.serverURL + '/' + type + '/', m)
      .pipe(
        catchError(this.handleError('Update ' + type + '.', null))
      );
  }

  getLikelyNextName(type: ZFTypes) {
    return this.http.get(this.serverURL + '/' + type + '/nextName')
      .pipe(
        catchError(this.handleError('GetNext ' + type + '.', {}))
      );
  }

  getFieldOptions(type: ZFTypes) {
    console.log('get field options for ' + type);
    return this.http.get(this.serverURL + '/' + type + '/autoCompleteOptions')
      .pipe(
        catchError(this.handleError(`Get ${type} autocomplete options.`, {}))
      );
  }

  /** =========== Stock Specific requests ===============
   *
   */
  getTankWalkerList(filter: any): Observable<any> {
    if (!filter) {
      filter = {};
    }
    const q = convertObjectToHTTPQueryParams(filter);
    return this.http.get(this.serverURL + '/stock/tankWalk' + q)
      .pipe(
        catchError(this.handleError('Get /stock/tankWalk.', []))
      );

  }

  getTankWalkerStock(id: any): Observable<any> {
    if (!id) {
      return of({});
    }
    return this.http.get(this.serverURL + '/stock/medium/' + id.toString())
      .pipe(
        catchError(this.handleError('Get stock/medium for tank walker. Id: ' + id + '.', {}))
      );
  }

  createSubStock(thing: StockFullDto) {
    return this.http.post(this.serverURL + '/stock/substock/', thing)
      .pipe(
        catchError(this.handleError('Create substock failed.', null))
      );
  }

  /**
   * Check which stocks are in a particular tank.
   */
  getStocksInTank(tankId: number): Observable<any> {
    return this.http.get(this.serverURL + '/swimmer/tank/' + tankId)
      .pipe(
        catchError(this.handleError('Get swimmers for tank ' + tankId, []))
      );
  }

  /**
   * Get label(s) for a particular tank.
   */
  getTankLabels(tankIds: string[]): Observable<any> {
    return this.http.get(this.serverURL + '/swimmer/label/' + tankIds.join(','))
      .pipe(
        catchError(this.handleError('Get labels for tanks ' + tankIds.join(', '), []))
      );
  }

  /**
   * Get all the mutation types
   */
  getMutationTypes(): Observable<any> {
    return this.http.get(this.serverURL + '/mutation-type')
      .pipe(
        catchError(this.handleError('Get mutation types.', []))
      );
  }

  /**
   * Get all the screen types
   */
  getScreenTypes(): Observable<any> {
    return this.http.get(this.serverURL + '/screen-type')
      .pipe(
        catchError(this.handleError('Get screen types.', []))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */

  /*
   * This generic handler was copied from the Angular tutorial.
   * And as a note to future, even thicker, self who will be going WTF?...
   * We use it to handle errors for all our http calls.  But all
   * our HTTP Calls return different types!  And the error handler
   * has to return the right type.  So, the error handler is
   * parameterized such that you can tell it what to return when
   * it is finished doing it's business.
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T | null> => {
      if (401 === error.status && this.authService.isAuthenticated) {
        this.message.open('Your session has ended unexpectedly',
          null, {duration: this.appState.confirmMessageDuration});
        this.authService.onLogout();
        this.router.navigateByUrl('/login').then();
      } else {
        this.message.open(operation + '. ' + error.error.message || error.status,
          null, {duration: this.appState.confirmMessageDuration});
      }
      // Let the app keep running by returning what we were told to.
      return of(result as T);
    };
  }
}

// this assumes that the params are scalar. Which they are.
export function convertObjectToHTTPQueryParams(params: any) {
  const paramArray: string[] = [];
  Object.keys(params).forEach(key => {
    if (params[key]) {
      paramArray.push(key + '=' + params[key]);
    }
  });
  if (paramArray.length > 0) {
    return '?' + paramArray.join('&');
  }  else {
    return '';
  }
}
