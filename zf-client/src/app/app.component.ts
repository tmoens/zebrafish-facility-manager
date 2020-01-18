import {Component} from '@angular/core';
import {environment} from "../environments/environment";
import {ConfigModel} from "./config-model";
import {ConfigService} from "./config.service";
import {AuthService} from "./auth/auth.service";

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
    <button (click)="authService.login()" *ngIf="!authService.loggedIn">Log In</button>
    <button (click)="authService.logout()" *ngIf="authService.loggedIn">Log Out</button>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'zf-client';
  config: ConfigModel;
  s: string;

  e = JSON.stringify(environment);

  constructor(
    public configService: ConfigService,
    public authService: AuthService,
  ) {
    this.config = configService.getConfig();
    this.s = JSON.stringify(this.config);

  }
}
