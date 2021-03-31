import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ImporterComponent} from './importer/importer.component';
import {ZFTool} from '../helpers/zf-tool';

const routes: Routes = [
  {
    path: ZFTool.IMPORT_TOOL.route,
    component: ImporterComponent,
    children: [],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImporterRoutingModule { }
