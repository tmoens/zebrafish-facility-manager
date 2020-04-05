import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LoaderService} from "../loader.service";
import {MatDialog} from "@angular/material/dialog";
import {ZFTool} from "../helpers/zf-tool";
import {AppStateService} from "../app-state.service";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
  zfTool = ZFTool;
  constructor(
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
