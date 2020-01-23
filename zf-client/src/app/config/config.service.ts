import {Injectable} from '@angular/core';
import {ConfigModel} from "./config-model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

/*
 * This service loads configuration information for a particular zebrafish facility.
 * This allows a single build of the zf_client to service multiple facilities
 * in a single build/deployment.
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

  constructor(private http: HttpClient) {
  }

  public getConfig(): ConfigModel {
    return this.config;
  }

  load() {
    return new Promise((resolve, reject) => {
      // TODO Figure out how to get the org name to append to the configServerPrefix
      this.http
        .get(environment.configServerPrefix + "/fhcrc.json")
        .subscribe(response => {
          this.config = response as ConfigModel;
          resolve(true);
        })
    })
  }
}
