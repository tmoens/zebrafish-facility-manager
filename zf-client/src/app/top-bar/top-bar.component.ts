import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ConfigService} from "../config/config.service";
import {LoaderService} from "../loader.service";
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../login/login.component";
import {ZFTool} from "../helpers/zf-tool";
import {AppStateService} from "../app-state.service";
import {PasswordChangeComponent} from "../login/password-change/password-change.component";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
  zfTool = ZFTool;
  isAuthenticated: boolean;
  constructor(
    public configService: ConfigService,
    private router: Router,
    private loginDialog: MatDialog,
    private passwordChangeDialog: MatDialog,
    private loaderService: LoaderService,
    public appState: AppStateService,
  ) {
  }

  async ngOnInit() {
    // Get the authentication state for immediate use
  }

  login() {
    const dialogRef = this.loginDialog.open(LoginComponent, {data: {}});
    dialogRef.afterClosed().subscribe((result) => {});
  }

  logout() {
    if (this.appState.isAuthenticated) {
      this.loaderService.logout().subscribe( () => {
        this.appState.onLogout();
        this.router.navigateByUrl('/splash');
      });
    }
  }

  onPasswordChange() {
    const dialogRef = this.passwordChangeDialog.open(PasswordChangeComponent, {data: {}});
    dialogRef.afterClosed().subscribe((result) => {});
  }


}
