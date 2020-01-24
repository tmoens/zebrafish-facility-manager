// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// production is true or false depending on if you want production build
// or a working build more suitable for debugging.
// configServerPrefix is a URL to which the client will go to get
// configuration information for how a particular zebrafish facility.
export const environment = {
  production: false,
  configServerPrefix: "http://localhost/zfm/config"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
