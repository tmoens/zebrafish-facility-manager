import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TankLabelComponent} from "./printing/tank-label/tank-label.component";
import {SplashComponent} from "./splash/splash.component";


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
    path: 'print/tankLabels/:tankIds',
    outlet: 'print',
    component: TankLabelComponent,
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
