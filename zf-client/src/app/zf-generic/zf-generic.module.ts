import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ZfSelectorListComponent} from './zf-selector-list/zf-selector-list.component';
import {MatListModule} from "@angular/material/list";
import {ZfDetailListComponent} from './zf-detail-list/zf-detail-list.component';


@NgModule({
  declarations: [ZfSelectorListComponent, ZfDetailListComponent],
  exports: [
    ZfSelectorListComponent,
    ZfDetailListComponent
  ],
  imports: [
    CommonModule,
    MatListModule
  ]
})
export class ZfGenericModule { }
