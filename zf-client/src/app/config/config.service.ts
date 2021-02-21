import {Injectable} from '@angular/core';
import {ConfigModel} from './config-model';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AppStateService} from '../app-state.service';
import {plainToClassFromExist} from 'class-transformer';

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
    private appStateService: AppStateService,
  ) {
    this.http = new HttpClient(handler);
  }

  public getConfig(): ConfigModel {
    return this.config;
  }

  // Load the facility specific client configuration data.
  // I hope the fields are self-explanatory.
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
        .subscribe((facilityConfig: ConfigModel) => {
          // Get the default configuration data
          const defaultConfig = new ConfigModel();

          // Merge in the data from the facility specific configuration
          facilityConfig = plainToClassFromExist(defaultConfig, facilityConfig);

          // Put the whole default facility config in the appState as a first class object.
          this.appStateService.facilityConfig = facilityConfig;

          resolve(true);
        })
    })
  }
}
