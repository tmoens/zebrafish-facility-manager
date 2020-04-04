import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ConfigService} from "../config/config.service";
import {LoaderService} from "../loader.service";
import {MatDialog} from "@angular/material/dialog";
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
    private passwordChangeDialog: MatDialog,
    private loaderService: LoaderService,
    public appState: AppStateService,
  ) {
  }

  async ngOnInit() {
  }

  login() {
    this.router.navigateByUrl('/login');
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
    this.router.navigateByUrl('/change-password');
  }
}
