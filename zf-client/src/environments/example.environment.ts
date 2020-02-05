// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// production is true or false depending on if you want production build
// or a working build more suitable for debugging.

// configServerPrefix is a URL to which the client will go to get
// configuration information for a particular zebrafish facility.
export const environment = {
  production: false,
  configServerPrefix: "http://localhost:4200/zfm/zf-client/facility-config"
};
