import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginContainerComponent } from './login/login-container.component';
import {LoginComponent} from "./login/login.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {PasswordResetComponent} from "./password-reset/password-reset.component";
import {PasswordChangeContainerComponent} from "./password-change/password-change-container.component";
import {PasswordChangeComponent} from "./password-change/password-change.component";



@NgModule({
  declarations: [
    LoginContainerComponent,
    LoginComponent,
    PasswordChangeContainerComponent,
    PasswordChangeComponent,
    PasswordResetComponent,
  ],
  exports: [
    LoginContainerComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class LoginModule { }
