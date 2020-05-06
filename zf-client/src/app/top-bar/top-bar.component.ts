import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from "@angular/material/dialog";
import {ZFTool} from "../helpers/zf-tool";
import {AuthApiService} from "../auth/auth-api.service";
import {AuthService} from "../auth/auth.service";
import {AppStateService} from "../app-state.service";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})

export class TopBarComponent implements OnInit {
  zfTool = ZFTool;
  constructor(
    private router: Router,
    private passwordChangeDialog: MatDialog,
    private authApiService: AuthApiService,
    public authService: AuthService,
    public appState: AppStateService,
  ) {
  }

  async ngOnInit() {
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  logout() {
    if (this.authService.isAuthenticated) {
      this.authApiService.logout().subscribe( () => {
        this.authService.onLogout();
        this.router.navigateByUrl('/splash');
      });
    }
  }
}
