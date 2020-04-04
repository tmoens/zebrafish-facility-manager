import {Injectable} from '@angular/core';
import {ConfigModel} from "./config-model";
import {HttpBackend, HttpClient} from "@angular/common/http";
import {Location} from "@angular/common";
import {environment} from "../../environments/environment";

/*
 * This service loads configuration information for a particular zebrafish facility.
 * This allows a single build of the zf_client to service multiple facilities
 * in a single build.
 *
 * That is, facility configuration is *not* compiled in through the environment.ts,
 * but is rather pulled in from the server at run-time.
 *
 * In particular, this service is used to provide an APP_INITIALIZER which
 * runs before Angular starts up.
 */


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public config: ConfigModel = null;
  private http: HttpClient;

  // Note that the use of HttpBackend here is done specifically to
  // avoid the AuthTokenInterceptor being fired before configuration is loaded.
  constructor(
    private handler: HttpBackend,
    private foo: Location,
  ) {
    this.http = new HttpClient(handler);
  }

  public getConfig(): ConfigModel {
    return this.config;
  }

  load() {
    return new Promise((resolve, reject) => {
      let url: string;
      if (environment.production) {
        url = location.origin + '/facility-config/' + location.host + '.json';
      } else {
        url = location.origin + '/facility-config/development.json';
      }
      this.http
        .get(url)
        .subscribe(response => {
          this.config = response as ConfigModel;
          resolve(true);
        })
    })
  }
}
