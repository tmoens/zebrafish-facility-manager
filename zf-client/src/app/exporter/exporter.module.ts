import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExporterRoutingModule} from './exporter-routing-module';
import { ExporterComponent } from './exporter/exporter.component';
import {AuthModule} from '../auth/auth.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {FlexModule} from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';



@NgModule({
  declarations: [
    ExporterComponent
  ],
  imports: [
    CommonModule,
    ExporterRoutingModule,
    AuthModule,
    MatToolbarModule,
    MatIconModule,
    FlexModule,
    MatCardModule,
  ]
})
export class ExporterModule { }
