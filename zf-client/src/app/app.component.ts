import {Component} from '@angular/core';
import {environment} from "../environments/environment";
import {ConfigModel} from "./config-model";
import {ConfigService} from "./config.service";

@Component({
  selector: 'app-root',
  template: `
    <div style="text-align:center" class="content">
      <h1>
        Welcome to {{title}}!
      </h1>
      <h2>{{e}}</h2>
      <h2>config: {{s}}</h2>
      <h2>hmm: {{configService.config.facilityName}}</h2>
    </div>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'zf-client';
  config: ConfigModel = null;
  s: string;

  e = JSON.stringify(environment);

  constructor(public configService: ConfigService) {
    this.config = configService.getConfig();
    this.s = JSON.stringify(this.config);

  }
}
