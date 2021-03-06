import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LoaderService} from "../../../loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormBuilder, Validators} from "@angular/forms";
import {UserDTO} from "../../UserDTO";
import {AppStateService} from "../../../app-state.service";
import {AuthApiService} from "../../auth-api.service";

@Component({
  selector: 'app-password-reset',
  template: `
    <section class="mat-typography">
      <div mat-dialog-title>Password Reset</div>
      <div mat-dialog-content>
        <form fxLayout="column">
          <mat-form-field>
            <input type="text" matInput name="noe" placeholder="Username or email" [(ngModel)]="usernameOrEmail">
          </mat-form-field>
        </form>
      </div>
      <div mat-dialog-actions fxLayout="row">
        <div class="fill-remaining-space"></div>
        <button mat-button (click)="onBackToLogin()" color="primary">Back to Login</button>
        <button mat-button (click)="onSubmit()" color="primary">Submit</button>
      </div>
    </section>`,
})

export class PasswordResetComponent implements OnInit {
  usernameOrEmail: string;

  constructor(
    public dialogRef: MatDialogRef<PasswordResetComponent>,
    private authApiService: AuthApiService,
    private message: MatSnackBar,
    private appState: AppStateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data && data.username) {
      this.usernameOrEmail = data.username;
    }
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.authApiService.resetPassword({usernameOrEmail: this.usernameOrEmail}).subscribe( (u: UserDTO) => {
      if (u) {
        this.message.open(
          "A new password has been sent to " + u.email +
          ". Please use it to and change your password",
          null, {duration: this.appState.confirmMessageDuration});
        this.dialogRef.close({username: u.username});
      }
    });
  }

  onBackToLogin() {
    this.dialogRef.close({username: this.usernameOrEmail});
  }
}
