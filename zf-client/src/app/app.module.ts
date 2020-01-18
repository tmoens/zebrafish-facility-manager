import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ConfigService} from "./config.service";
import {HttpClientModule} from "@angular/common/http";
import {LocationStrategy, PathLocationStrategy} from "@angular/common";
import {AuthService} from "./auth/auth.service";

export function configProviderFactory(provider: ConfigService) {
  return () => provider.load();
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: configProviderFactory, deps: [ConfigService], multi: true},
    {provide: LocationStrategy, useClass: PathLocationStrategy},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
