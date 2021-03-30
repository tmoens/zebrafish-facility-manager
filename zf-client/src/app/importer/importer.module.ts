import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ImporterRoutingModule} from './importer-routing.module';
import {ImporterComponent} from './importer/importer.component';
import {ExcelImporterComponent} from './excel-importer/excel-importer.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MutationManagerModule} from '../mutation-manager/mutation-manager.module';
import {MatButtonModule} from '@angular/material/button';
import {FlexModule} from '@angular/flex-layout';
import {AuthModule} from '../auth/auth.module';


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
    MatMenuModule,
    MatIconModule,
    MutationManagerModule,
    MatButtonModule,
    FlexModule,
    AuthModule,
  ]
})
export class ImporterModule { }
