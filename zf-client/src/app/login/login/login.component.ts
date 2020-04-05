import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LoaderService} from '../../loader.service';
import {AppStateService} from '../../app-state.service';

@Component({
  selector: 'zfm-login',
  template: `
    <section class="mat-typography">
      <div mat-dialog-title>Login</div>
      <form (ngSubmit)="onSubmit()">
        <div mat-dialog-content>
          <div fxLayout="column">
            <mat-form-field>
              <input matInput name="username"  type="text" placeholder="Username" [(ngModel)]="username">
            </mat-form-field>
            <mat-form-field>
              <input matInput name="password" type="text" placeholder="Password" [(ngModel)]="password">
            </mat-form-field>
          </div>
        </div>
        <div mat-dialog-actions fxLayout="row">
          <div class="fill-remaining-space"></div>
          <button mat-button type="submit" color="primary">Submit</button>
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

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private loaderService: LoaderService,
    private appStateService: AppStateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (data && data.username) {
      this.username = data.username;
    }
  }

  ngOnInit(): void {}

  onSubmit() {
    this.loaderService.login(this.username, this.password).subscribe( (token: any) => {
      if (token) {
        this.dialogRef.close();
        this.appStateService.onLogin(token.access_token);
      } else {
        this.appStateService.onLoginFailed();
      }
    });
  }

  onForgotPassword() {
    this.dialogRef.close({reset: true, username: this.username});
  }
}
