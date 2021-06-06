import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ZFTool} from '../helpers/zf-tool';
import {ExporterComponent} from './exporter/exporter.component';

const routes: Routes = [
  {
    path: ZFTool.EXPORT_TOOL.route,
    component: ExporterComponent,
    children: [],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExporterRoutingModule { }
