import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HttpClientModule} from '@angular/common/http';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatNativeDateModule} from '@angular/material/core';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule} from '@angular/common';
import {StockMenuComponent} from './stock-menu/stock-menu.component';
import {StockManagerComponent} from './stock-manager.component';
import {StockSelectorComponent} from './stock-selector/stock-selector.component';
import {StockEditorComponent} from './stock-editor/stock-editor.component';
import {StockViewerComponent} from './stock-viewer/stock-viewer.component';
import {StockManagerRoutingModule} from './stock-manager-routing.module';
import {StockGeneticsEditorComponent} from './stock-genetics-editor/stock-genetics-editor.component';
import {StockSwimmersEditorComponent} from './stock-swimmers-editor/stock-swimmers-editor.component';
import {TankNameValidator} from './validators/tankNameValidator';
import {StockNameCheckValidator} from './validators/stockNameCheck';

@NgModule({
  declarations: [
    StockEditorComponent,
    StockSelectorComponent,
    StockManagerComponent,
    StockMenuComponent,
    StockGeneticsEditorComponent,
    StockSelectorComponent,
    StockSwimmersEditorComponent,
    StockViewerComponent,
    TankNameValidator,
    StockNameCheckValidator,
  ],
  imports: [
    StockManagerRoutingModule,
    CommonModule,
    FlexLayoutModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    DragDropModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    StockMenuComponent
  ]
})

export class StockManagerModule {}
