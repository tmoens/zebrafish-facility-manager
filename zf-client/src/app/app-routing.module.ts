import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TankLabelComponent} from "./printing/tank-label/tank-label.component";
import {SplashComponent} from "./splash/splash.component";
import {PasswordChangeContainerComponent} from "./login/password-change/password-change-container.component";
import {LoginContainerComponent} from "./login/login/login-container.component";


const routes: Routes = [
  {
    path: '',
    component: SplashComponent,
  },
  {
    path: 'splash',
    component: SplashComponent,
  },
  {
    path: 'login',
    component: LoginContainerComponent,
  },
  {
    path: 'change-password',
    component: PasswordChangeContainerComponent,
  },
  {
    path: 'print/tankLabels/:tankIds',
    outlet: 'print',
    component: TankLabelComponent,
  },
  {
    path: '**',
    component: SplashComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
