import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import {CommonModule} from '@angular/common';
import {TransgeneEditorComponent} from './transgen-editor/transgene-editor.component';
import {TransgeneManagerComponent} from './transgene-manager.component';
import {TransgeneSelectorComponent} from './transgene-selector/transgene-selector.component';
import {TransgeneViewerComponent} from './transgene-viewer/transgene-viewer.component';
import {TransgeneManagerRoutingModule} from './transgene-manager-routing.module';
import {TransgeneMenuComponent} from './transgene-menu/transgene-menu.component';
import {AuthModule} from "../auth/auth.module";
import {MatSidenavModule} from "@angular/material/sidenav";
import { TransgeneMiniViewerComponent } from './transgene-mini-viewer/transgene-mini-viewer.component';

@NgModule({
  declarations: [
    TransgeneEditorComponent,
    TransgeneManagerComponent,
    TransgeneMenuComponent,
    TransgeneSelectorComponent,
    TransgeneViewerComponent,
    TransgeneMiniViewerComponent,
  ],
  imports: [
    TransgeneManagerRoutingModule,
    CommonModule,
    FlexLayoutModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    AuthModule,
    MatSidenavModule,
  ],
  exports: [
    TransgeneMenuComponent,
    TransgeneMiniViewerComponent

  ]
})

export class TransgeneManagerModule {}
