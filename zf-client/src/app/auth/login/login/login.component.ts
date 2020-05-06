import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppStateService} from '../../../app-state.service';
import {AuthApiService} from "../../auth-api.service";
import {AuthService} from "../../auth.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'zfm-login',
  template: `
    <section class="mat-typography">
      <div mat-dialog-title>Login</div>
      <form>
        <div mat-dialog-content>
          <div fxLayout="column">
            <mat-form-field>
              <input matInput name="username"  type="text" placeholder="Username"
                     [formControl]="usernameFC">
            </mat-form-field>
            <mat-form-field>
              <input matInput name="password" placeholder="Password" type="password"
                     [formControl]="passwordFC">
            </mat-form-field>
          </div>
        </div>
        <div mat-dialog-actions fxLayout="row">
          <div class="fill-remaining-space"></div>
          <button mat-button type="submit" (click)="onSubmit()" color="primary">Submit</button>
        </div>
      </form>
      <div style="height: 20px"></div>
      <button mat-button (click)="onForgotPassword()" style="text-align: right; font-size: 12px">Forgot Password...
      </button>
    </section>
`,
})
export class LoginComponent implements OnInit {
  username: string = null;
  password: string = null;

  usernameFC: FormControl = new FormControl('');
  passwordFC: FormControl = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private authApiService: AuthApiService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data && data.username) {
      this.usernameFC.setValue(data.username);
    }
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {}

  onSubmit() {
    this.authApiService.login(this.usernameFC.value, this.passwordFC.value).subscribe( (token: any) => {
      if (token) {
        this.dialogRef.close();
        this.authService.onLogin(token.access_token);
      } else {
        this.authService.onLoginFailed();
      }
    });
  }

  onForgotPassword() {
    this.dialogRef.close({reset: true, username: this.username});
  }
}
