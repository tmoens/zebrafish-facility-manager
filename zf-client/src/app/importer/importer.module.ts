import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImporterRoutingModule } from './importer-routing.module';
import { ImporterComponent } from './importer/importer.component';
import {ExcelImporterComponent} from './excel-importer/excel-importer.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatToolbarModule} from '@angular/material/toolbar';


@NgModule({
  declarations: [
    ImporterComponent,
    ExcelImporterComponent,
  ],
  imports: [
    CommonModule,
    ImporterRoutingModule,
    MatProgressBarModule,
    MatToolbarModule,
  ]
})
export class ImporterModule { }
