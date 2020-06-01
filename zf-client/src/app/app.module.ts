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
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTableModule} from "@angular/material/table";
import {MatToolbarModule} from "@angular/material/toolbar";
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
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {StorageServiceModule} from "ngx-webstorage-service";
import {LoginGuardService} from "./auth/guards/login-guard.service";
import {SplashComponent} from './splash/splash.component';
import {StockService} from "./stock-manager/stock.service";
import {UserAdminModule} from "./auth/user-admin/user-admin.module";
import {RoleGuardService} from "./auth/guards/role-guard.service";
import {AuthModule} from "./auth/auth.module";
import {LoginModule} from "./auth/login/login.module";
import {AppStateService} from "./app-state.service";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import { TestnavComponent } from './testnav/testnav.component';
import { LayoutModule } from '@angular/cdk/layout';
import {AuthService} from "./auth/auth.service";
import {QRCodeModule} from "angularx-qrcode";
import {MatTooltipModule} from "@angular/material/tooltip";

export function appStateProviderFactory(provider: AppStateService) {
  return () => provider.initialize();
}

export function configProviderFactory(provider: ConfigService) {
  return () => provider.load();
}

export function stockServiceProviderFactory(provider: StockService) {
  return () => provider.placeholder();
}

export function authServiceProviderFactory(provider: AppStateService) {
  return () => provider.initialize();
}

@NgModule({
  declarations: [
    AppComponent,
    CanDeactivateComponent,
    TopBarComponent,
    TankLabelComponent,
    SplashComponent,
    TestnavComponent,
  ],
  imports: [
    AuthModule,
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
    MatMomentDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    QRCodeModule,
    ReactiveFormsModule,
    AppRoutingModule,
    StorageServiceModule,
    LayoutModule,
    MatTooltipModule,
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
    {provide: APP_INITIALIZER, useFactory: authServiceProviderFactory, deps: [AuthService], multi: true},
    CanDeactivateGuard,
    DialogService,
    LoginGuardService,
    RoleGuardService,
    {provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true},
  ],
  exports: [
    TopBarComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
