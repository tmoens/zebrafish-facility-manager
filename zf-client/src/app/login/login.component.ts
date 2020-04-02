import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { LoaderService } from '../loader.service';
import { AppStateService } from '../app-state.service';
import {ActivatedRoute, Router} from "@angular/router";
import {PasswordResetComponent} from "./password-reset/password-reset.component";
import {PasswordChangeComponent} from "./password-change/password-change.component";

@Component({
  selector: 'zfm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string = null;
  password: string = null;

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private loaderService: LoaderService,
    private appStateService: AppStateService,
    private passwordResetDialog: MatDialog,
    private passwordChangeDialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    this.loaderService.login(this.username, this.password).subscribe( (token: any) => {
      if (token) {
        this.dialogRef.close();
        this.appStateService.onLogin(token.access_token);
        if (this.appStateService.isPasswordChangeRequired()) {
          const dialogRef = this.passwordChangeDialog.open(PasswordChangeComponent, {data: {}});
          dialogRef.afterClosed().subscribe((result) => {});
        }
      } else {
        this.appStateService.onLoginFailed();
      }
    });
  }

  onForgotPassword() {
    this.dialogRef.close();
    const dialogRef = this.passwordResetDialog.open(PasswordResetComponent, {data: {}});
    dialogRef.afterClosed().subscribe((result) => {});

  }
}
