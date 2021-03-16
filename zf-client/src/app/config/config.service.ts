import {Injectable} from '@angular/core';
import {ClientConfig} from '../common/config/client-config';
import {HttpBackend, HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AppStateService} from '../app-state.service';
import {plainToClassFromExist} from 'class-transformer';
import {LoaderService} from '../loader.service';

/*
 * This service loads configuration information for a particular zebrafish facility.
 *
 * This service is used to provide an APP_INITIALIZER which runs before Angular starts up.
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
  load() {
    this.loader.getClientConfig().subscribe((config: ClientConfig) => {
      this.appStateService.facilityConfig = config
    });
  }
}
