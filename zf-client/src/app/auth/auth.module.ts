import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HideUnauthorizedDirective} from "./hide-unauthorized.directive";
import {UserAdminModule} from "./user-admin/user-admin.module";
import {LoginModule} from "./login/login.module";
import {AuthRoutingModule} from "./auth-routing.module";


@NgModule({
  declarations: [
    HideUnauthorizedDirective,
  ],
  imports: [
    CommonModule,
    UserAdminModule,
    LoginModule,
    AuthRoutingModule,
  ],
  exports: [
    HideUnauthorizedDirective,
  ]

})
export class AuthModule {
}
