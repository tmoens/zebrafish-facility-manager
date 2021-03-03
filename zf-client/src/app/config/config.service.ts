import {Injectable} from '@angular/core';
import {ClientConfig} from '../common/config/client-config';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AppStateService} from '../app-state.service';
import {plainToClassFromExist} from 'class-transformer';
import {LoaderService} from '../loader.service';

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

  public config: ClientConfig = null;

  constructor(
    private appStateService: AppStateService,
    private loader: LoaderService,
  ) {
    this.appStateService.facilityConfig = new ClientConfig();
  }

  // Load the facility specific client configuration data.
  // I hope the fields are self-explanatory.
  load() {
    this.loader.getClientConfig().subscribe((config: ClientConfig) => {
      console.log(JSON.stringify(config, null, 2));
      this.appStateService.facilityConfig = config
    });
  }
}
