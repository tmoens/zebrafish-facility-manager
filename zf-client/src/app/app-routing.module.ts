import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TankLabelComponent} from "./printing/tank-label/tank-label.component";


const routes: Routes = [
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
