import {Component, OnInit} from '@angular/core';
import {AppStateService, ZFTool} from '../app-state.service';
import {Router} from '@angular/router';
import {ConfigService} from "../config/config.service";
import {LoaderService} from "../loader.service";
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../login/login.component";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  zfTool = ZFTool;
  isAuthenticated: boolean;
  constructor(
    public configService: ConfigService,
    public appState: AppStateService,
    private router: Router,
    private loginDialog: MatDialog,
    private loaderService: LoaderService,
  ) {
  }

  async ngOnInit() {
    // Get the authentication state for immediate use
  }

  login() {
    const dialogRef = this.loginDialog.open(LoginComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Logging in');
      console.log(this.appState.getAccessTokenPayload());
    });
  }

  logout() {
    if (this.appState.isAuthenticated()) {
      console.log(this.appState.getAccessTokenPayload());
      this.loaderService.logout(this.appState.getAccessTokenPayload().sub).subscribe( () => {
        this.appState.accessToken = null;
      });
    }
  }
}
