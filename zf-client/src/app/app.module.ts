import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ConfigService} from "./config/config.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {LocationStrategy, PathLocationStrategy} from "@angular/common";
import {TopBarComponent} from "./top-bar/top-bar.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";
import {MatNativeDateModule} from "@angular/material/core";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTableModule} from "@angular/material/table";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {TankLabelComponent} from "./printing/tank-label/tank-label.component";
import {TransgeneManagerModule} from "./transgene-manager/transgene-manager.module";
import {StockManagerModule} from "./stock-manager/stock-manager.module";
import {MutationManagerModule} from "./mutation-manager/mutation-manager.module";
import {ZfGenericModule} from "./zf-generic/zf-generic.module";
import {CanDeactivateComponent} from "./guards/can-deactivate-component";
import {StockGeneticsEditorComponent} from "./stock-manager/stock-genetics-editor/stock-genetics-editor.component";
import {CanDeactivateGuard} from "./guards/can-deactivate-guard";
import {DialogService} from "./dialog.service";
import {AuthTokenInterceptor} from "./auth/auth-token.interceptor";
import {LoginComponent} from "./login/login/login.component";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {StorageServiceModule} from "ngx-webstorage-service";
import {LoginGuardService} from "./guards/login-guard.service";
import {ErrorInterceptor} from "./auth/http-error.interceptor";
import {SplashComponent} from './splash/splash.component';
import {StockService} from "./stock-manager/stock.service";
import {UserAdminModule} from "./user-admin/user-admin.module";
import {RoleGuardService} from "./guards/role-guard.service";
import {AuthModule} from "./auth/auth.module";
import {LoginModule} from "./login/login.module";
import {AppStateService} from "./app-state.service";

export function appStateProviderFactory(provider: AppStateService) {
  return () => provider.initialize();
}

export function configProviderFactory(provider: ConfigService) {
  return () => provider.load();
}

export function stockServiceProviderFactory(provider: StockService) {
  return () => provider.placeholder();
}

@NgModule({
  declarations: [
    AppComponent,
    CanDeactivateComponent,
    TopBarComponent,
    TankLabelComponent,
    SplashComponent,
  ],
  imports: [
    LoginModule,
    ZfGenericModule,
    MutationManagerModule,
    StockManagerModule,
    TransgeneManagerModule,
    UserAdminModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    AppRoutingModule,
    StorageServiceModule,
    AuthModule,
  ],
  entryComponents: [
    StockGeneticsEditorComponent,
    CanDeactivateComponent,
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: appStateProviderFactory, deps: [AppStateService], multi: true},
    {provide: APP_INITIALIZER, useFactory: configProviderFactory, deps: [ConfigService, AppStateService], multi: true},
    {provide: APP_INITIALIZER, useFactory: stockServiceProviderFactory, deps: [StockService], multi: true},
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    CanDeactivateGuard,
    DialogService,
    LoginGuardService,
    RoleGuardService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  ],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
