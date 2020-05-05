import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserMenuComponent} from './user-menu/user-menu.component';
import {UserSelectorComponent} from './user-selector/user-selector.component';
import {UserViewerComponent} from './user-viewer/user-viewer.component';
import {UserEditorComponent} from './user-editor/user-editor.component';
import {UserAdminComponent} from "./user-admin.component";
import {UserAdminRoutingModule} from "./user-admin-routing.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatListModule} from "@angular/material/list";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatMenuModule} from "@angular/material/menu";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSidenavModule} from "@angular/material/sidenav";

@NgModule({
  declarations: [
    UserAdminComponent,
    UserMenuComponent,
    UserSelectorComponent,
    UserViewerComponent,
    UserEditorComponent,
  ],
  imports: [
    UserAdminRoutingModule,
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    MatToolbarModule,
    MatSidenavModule,
  ],
  exports: [
    UserMenuComponent,
  ]

})
export class UserAdminModule { }
