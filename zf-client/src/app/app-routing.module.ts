import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {TankLabelComponent} from "./printing/tank-label/tank-label.component";
import {StockManagerComponent} from "./stock-manager/stock-manager.component";


const routes: Routes = [
  {
    path: '',
    component: StockManagerComponent,
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
