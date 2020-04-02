import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { UserSelectorComponent } from './user-selector/user-selector.component';
import { UserViewerComponent } from './user-viewer/user-viewer.component';
import { UserEditorComponent } from './user-editor/user-editor.component';
import {UserAdminComponent} from "./user-admin.component";
import {UserAdminRoutingModule} from "./user-admin-routing.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {HttpClientModule} from "@angular/common/http";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatDialogModule} from "@angular/material/dialog";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatNativeDateModule} from "@angular/material/core";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatTableModule} from "@angular/material/table";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatMenuModule} from "@angular/material/menu";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { PasswordResetComponent } from '../login/password-reset/password-reset.component';
import { PasswordChangeComponent } from '../login/password-change/password-change.component';

@NgModule({
  declarations: [
    UserAdminComponent,
    UserMenuComponent,
    UserSelectorComponent,
    UserViewerComponent,
    UserEditorComponent,
    PasswordResetComponent,
    PasswordChangeComponent,
  ],
  imports: [
    UserAdminRoutingModule,
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
    UserMenuComponent,
  ]

})
export class UserAdminModule { }
