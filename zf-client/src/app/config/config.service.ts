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
        .subscribe((response: ConfigModel) => {
          // Get the default configuration data
          const defaultConfig = new ConfigModel();

          // Merge in the data from the facility specific configuration
          response = plainToClassFromExist(defaultConfig, response);

          // Put the configuration information into the application state
          // I'm not really sure why I did it this way instead of just sticking
          // the config data in as a plain json object and letting interested parties suck
          // it out as an json object and then go get the bits of interest.  If I had to
          // I would do better, but since there are at present so few fields, I'll just
          // live with it as is.
          this.appStateService.setState('facilityName', response.facilityName);
          this.appStateService.setState('facilityAbbrv', response.facilityAbbrv);
          this.appStateService.setState('tankNumberingHint', response.tankNumberingHint);
          this.appStateService.setState('tankLabelLayout', response.tankLabelConfig.layout);
          this.appStateService.setState('tankLabelPointSize', response.tankLabelConfig.fontPointSize);
          this.appStateService.setState('tankLabelFontFamily', response.tankLabelConfig.fontFamily);
          this.appStateService.setState('tankLabelWidth', response.tankLabelConfig.widthInInches);
          this.appStateService.setState('tankLabelHeight', response.tankLabelConfig.heightInInches);
          this.appStateService.setState('tankLabelQrCode', response.tankLabelConfig.showQrCode);
          this.appStateService.setState('hidePI', !!(response.hidePI));
          resolve(true);
        })
    })
  }
}
