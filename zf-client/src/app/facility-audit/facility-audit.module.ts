import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwimmerEditorComponent } from './swimmer-editor/swimmer-editor.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FlexModule} from '@angular/flex-layout';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';



@NgModule({
  declarations: [SwimmerEditorComponent],
  exports: [
    SwimmerEditorComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FlexModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class FacilityAuditModule { }
