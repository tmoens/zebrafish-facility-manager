import {Injectable} from '@angular/core';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import {from, of, Observable, BehaviorSubject, combineLatest, throwError} from 'rxjs';
import {tap, catchError, concatMap, shareReplay} from 'rxjs/operators';
import {Router} from '@angular/router';
import {LocationStrategy} from '@angular/common';
import {ConfigModel} from "../config/config-model";
import {ConfigService} from "../config/config.service";
import {AppStateService} from "../app-state.service";

// This service is responsible for negotiating authorization for a user
// against a facility-specific "application" hosted on Auth0.  It handles
// all the ins and outs of login, logout, auto-login on page reload and
// all that jazz.
// It is largely purloined from the Auth0 example with a few enhancements.
// In particular, the example did not account for deployment of the client
// anywhere other than the web server root (i.e. no base-href).

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  config: ConfigModel;
  auth0Client$: Observable<Auth0Client>;
  isAuthenticated$: Observable<boolean>;
  handleRedirectCallback$: Observable<RedirectLoginResult>;

  // Create subject and public observable of user profile data
  private userProfileSubject$ = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject$.asObservable();

  // Create a local property for login status
  loggedIn: boolean = null;

  constructor(private router: Router,
              private locationStrategy: LocationStrategy,
              private configService: ConfigService,
              private appStateService: AppStateService,
  ) {
    this.config = this.configService.getConfig();

    // This should only be called on app initialization
    // Create an observable of Auth0 instance of client
    this.auth0Client$ = (from(
      createAuth0Client({
        domain: this.config.auth0Domain,
        client_id: this.config.auth0ClientId,
        redirect_uri: `${window.location.origin}${this.locationStrategy.getBaseHref()}`
      })
    ) as Observable<Auth0Client>).pipe(
      shareReplay(1), // Every subscription receives the same shared value
      catchError(err => throwError(err))
    );

    // Define observables for SDK methods that return promises by default
    // For each Auth0 SDK method, first ensure the client instance is ready
    // concatMap: Using the client instance, call SDK method; SDK returns a promise
    // from: Convert that resulting promise into an observable
    this.isAuthenticated$ = this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.isAuthenticated())),
      tap(res => this.loggedIn = res)
    );
    this.handleRedirectCallback$ = this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.handleRedirectCallback()))
    );

    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated
    this.localAuthSetup();
    // Handle redirect from Auth0 login
    this.handleAuthCallback();


  }

  // When calling, options can be passed if desired
  // https://auth0.github.io/auth0-spa-js/classes/auth0client.html#getuser
  getUser$(options?): Observable<any> {
    return this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.getUser(options))),
      tap(user => this.userProfileSubject$.next(user))
    );
  }

  private localAuthSetup() {

    // Set up local authentication streams
    const checkAuth$ = this.isAuthenticated$.pipe(
      concatMap((loggedIn: boolean) => {
        if (loggedIn) {
          // If authenticated, get user and set in app
          // NOTE: you could pass options here if needed
          return this.getUser$();
        }
        // If not authenticated, return stream that emits 'false'
        return of(loggedIn);
      })
    );
    checkAuth$.subscribe();
  }

  // A desired redirect path (where to go after login) can be passed to login method
  // (e.g., from a route guard)
  login(redirectPath: string = null) {
    // If no redirect path is supplied, cook one up
    if (!redirectPath) {
      // getDefaultURI just remembers where the user was from the browser's local storage.
      redirectPath = this.appStateService.getDefaultURI();
    }
    // Ensure Auth0 client instance exists
    this.auth0Client$.subscribe((client: Auth0Client) => {
      // Call method to log in
      client.loginWithRedirect({
        redirect_uri: `${window.location.origin}${this.locationStrategy.getBaseHref()}`,
        appState: {target: redirectPath}
      });
    });
  }

  private handleAuthCallback() {
    // Call when app reloads after user logs in with Auth0
    const params = window.location.search;
    if (params.includes('code=') && params.includes('state=')) {
      let targetRoute: string; // Path to redirect to after login processsed
      const authComplete$ = this.handleRedirectCallback$.pipe(
        // Have client, now call method to handle auth callback redirect
        tap(cbRes => {
          // Get and set target redirect route from callback results
          targetRoute = cbRes.appState && cbRes.appState.target ? cbRes.appState.target : '/';
        }),
        concatMap(() => {
          // Redirect callback complete; get user and login status
          return combineLatest([
            this.getUser$(),
            this.isAuthenticated$
          ]);
        })
      );
      // Subscribe to authentication completion observable
      // Response will be an array of user and login status
      authComplete$.subscribe(([user, loggedIn]) => {
        // Redirect to target route after callback processing
        this.router.navigate([targetRoute]);
      });
    }
  }

  logout() {
    // Ensure Auth0 client instance exists
    this.auth0Client$.subscribe((client: Auth0Client) => {
      // Call method to log out
      client.logout({
        client_id: this.config.auth0ClientId,
        returnTo: `${window.location.origin}${this.locationStrategy.getBaseHref()}`
      });
    });
  }

  getTokenSilently$(options?): Observable<string> {
    return this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.getTokenSilently(options)))
    );
  }

}
