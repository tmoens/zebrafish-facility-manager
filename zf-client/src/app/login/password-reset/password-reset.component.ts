import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LoaderService} from "../../loader.service";
import {AppStateService} from "../../app-state.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LoginComponent} from "../login.component";
import {CONFIRM_MESSAGE_DURATION} from "../../constants";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})

export class PasswordResetComponent implements OnInit {
  mfForm = this.fb.group({
    usernameOrEmail: ['', [Validators.required]],
  } );
  constructor(
    public dialogRef: MatDialogRef<PasswordResetComponent>,
    private loaderService: LoaderService,
    private message: MatSnackBar,
    private loginDialog: MatDialog,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.loaderService.resetPassword(this.mfForm.getRawValue()).subscribe( (email: string) => {
      if (email) {
        this.message.open(
          "Your password has been reset and sent to " + email + "Please log in and change your password once you receive it.",
          null, {duration: CONFIRM_MESSAGE_DURATION});
        this.dialogRef.close();
        const dialogRef = this.loginDialog.open(LoginComponent, {data: {}});
        }
    });
  }

  onBackToLogin() {
    this.dialogRef.close();
    const dialogRef = this.loginDialog.open(LoginComponent, {data: {}});
    dialogRef.afterClosed().subscribe((result) => {});
  }
}
