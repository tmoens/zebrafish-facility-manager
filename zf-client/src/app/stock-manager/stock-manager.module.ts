import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatNativeDateModule} from '@angular/material/core';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
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
import {AuthModule} from '../auth/auth.module';
import {MatCardModule} from '@angular/material/card';
import {MatSidenavModule} from '@angular/material/sidenav';
import {DateToAgePipe} from './date-to-age.pipe';
import {TankWalkerComponent} from './tank-walker/tank-walker.component';
import {StockMiniViewerComponent} from './stock-mini-viewer/stock-mini-viewer.component';
import {MutationManagerModule} from '../mutation-manager/mutation-manager.module';
import {TransgeneManagerModule} from '../transgene-manager/transgene-manager.module';
import {ZfGenericModule} from '../zf-generic/zf-generic.module';
import {CrossLabelMakerComponent} from './cross-label-maker/cross-label-maker.component';

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
    TankWalkerComponent,
    TankNameValidator,
    StockNameCheckValidator,
    DateToAgePipe,
    StockMiniViewerComponent,
    CrossLabelMakerComponent,
  ],
  imports: [
    StockManagerRoutingModule,
    CommonModule,
    FlexLayoutModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    AuthModule,
    MatSidenavModule,
    MutationManagerModule,
    TransgeneManagerModule,
    ZfGenericModule,
  ],
  exports: [
    StockMenuComponent
  ]
})

export class StockManagerModule {}
