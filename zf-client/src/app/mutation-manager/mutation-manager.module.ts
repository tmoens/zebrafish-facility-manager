import {NgModule} from '@angular/core';
import {MutationManagerRoutingModule} from './mutation-manager-routing.module';
import {MutationManagerComponent} from './mutation-manager.component';
import {MutationSelectorComponent} from './mutation-selector/mutation-selector.component';
import {MutationEditorComponent} from './mutation-editor/mutation-editor.component';
import {MutationViewerComponent} from './mutation-viewer/mutation-viewer.component';
import {MutationMenuComponent} from './mutation-menu/mutation-menu.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import {CommonModule} from '@angular/common';
import {AuthModule} from "../auth/auth.module";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MutationMiniViewerComponent} from './mutation-mini-viewer/mutation-mini-viewer.component';
import {MutationTinyViewerComponent} from "./mutation-mini-viewer/mutation-tiny-viewer.component";

@NgModule({
  declarations: [
    MutationEditorComponent,
    MutationManagerComponent,
    MutationMenuComponent,
    MutationSelectorComponent,
    MutationViewerComponent,
    MutationMiniViewerComponent,
    MutationTinyViewerComponent,
  ],
  imports: [
    MutationManagerRoutingModule,
    CommonModule,
    FlexLayoutModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    AuthModule,
    MatCheckboxModule,
    MatSidenavModule,
  ],
  exports: [
    MutationMenuComponent,
    MutationMiniViewerComponent
  ]
})

export class MutationManagerModule {}
