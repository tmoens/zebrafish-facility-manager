import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {PasswordChangeContainerComponent} from './login/password-change/password-change-container.component';
import {LoginContainerComponent} from "./login/login/login-container.component";

const userAdminRoutes: Routes = [
  {
    path: 'login',
    component: LoginContainerComponent,
  },
  {
    path: 'change_password',
    component: PasswordChangeContainerComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(userAdminRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class AuthRoutingModule { }
