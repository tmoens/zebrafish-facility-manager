import {Component} from '@angular/core';
import {environment} from "../environments/environment";
import {ConfigModel} from "./config/config-model";
import {ConfigService} from "./config/config.service";
import {AuthService} from "./auth/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'zf-client';

  constructor() {}
}
