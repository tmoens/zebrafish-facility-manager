import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ImporterComponent} from './importer/importer.component';

const routes: Routes = [
  {
    path: 'importer',
    component: ImporterComponent,
    children: [],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImporterRoutingModule { }
