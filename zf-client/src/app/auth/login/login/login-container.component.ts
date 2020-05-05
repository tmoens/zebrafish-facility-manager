import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "./login.component";
import {PasswordResetComponent} from "../password-reset/password-reset.component";
import {ZFTool} from "../../../helpers/zf-tool";
import {ActivatedRoute, ParamMap} from "@angular/router";

/**
 * This container does two things:
 * 1) provides a target for a login route (I do not think you can route to a dialog simply)
 * 2) provides a context for the back and forth between the login and password reset dialogs.
 */


@Component({
  selector: 'app-login-container',
  template: `
    <div class="big-background"></div>
  `,
  styleUrls: ['./login-container.scss']
})

export class LoginContainerComponent implements OnInit {

  constructor(
    private loginDialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.openLoginDialog();
  }




  openLoginDialog(username = null) {
    const dialogRef = this.loginDialog.open(LoginComponent, {data: (username) ? {username: username} : {} });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.reset) {
        this.openPasswordResetDialog(result.username);
      }
    });
  }

  openPasswordResetDialog (username = null) {
    const dialogRef = this.loginDialog.open(PasswordResetComponent, {data: (username) ? {username: username} : {} });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.username) {
        this.openLoginDialog( result.username);
      } else {
        this.openLoginDialog();
      }
    });

  }
}
