import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LoaderService} from "../loader.service";
import {MatDialog} from "@angular/material/dialog";
import {ZFTool} from "../helpers/zf-tool";
import {AppStateService} from "../app-state.service";

@Component({
  selector: 'app-top-bar',
  template: `
    <mat-toolbar *ngIf="appState.loggedIn$ | async" fxLayoutGap="10px">
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>menu</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="onPasswordChange()">
          <mat-icon>sync</mat-icon>
          <span>Change Password</span>
        </button>
        <mat-divider></mat-divider>
        <div>
          <app-user-menu *ngIf="appState.activeTool === zfTool.USER_MANAGER"></app-user-menu>
        </div>
        <app-transgene-menu *ngIf="appState.activeTool === zfTool.TRANSGENE_MANAGER"></app-transgene-menu>
        <app-mutation-menu *ngIf="appState.activeTool === zfTool.MUTATION_MANAGER"></app-mutation-menu>
        <app-stock-menu *ngIf="appState.activeTool === zfTool.STOCK_MANAGER"></app-stock-menu>
      </mat-menu>
      <span>{{appState.activeTool.display_name}} for {{appState.getState('facilityName')}}</span>
      <span class="fill-remaining-space"></span>
      <button mat-button [disabled]="appState.activeTool === zfTool.STOCK_MANAGER"
              [routerLink]="zfTool.STOCK_MANAGER.route" color="primary">
        {{zfTool.STOCK_MANAGER.display_name}}
      </button>
      <button mat-button [disabled]="appState.activeTool === zfTool.MUTATION_MANAGER"
              [routerLink]="zfTool.MUTATION_MANAGER.route" color="primary">
        {{zfTool.MUTATION_MANAGER.display_name}}
      </button>
      <button mat-button [disabled]="appState.activeTool === zfTool.TRANSGENE_MANAGER"
              [routerLink]="zfTool.TRANSGENE_MANAGER.route" color="primary">
        {{zfTool.TRANSGENE_MANAGER.display_name}}
      </button>
      <button mat-button zfmHideUnauthorized="admin" [disabled]="appState.activeTool === zfTool.USER_MANAGER"
              [routerLink]="zfTool.USER_MANAGER.route" color="primary">
        {{zfTool.USER_MANAGER.display_name}}
      </button>
      <button mat-button (click)="logout()"
              [matTooltip]="appState.getLoggedInUserName()">
        Logout
      </button>
      <!--  <button mat-button (click)="onPasswordChange()">-->
      <!--    Change Password-->
      <!--  </button>-->
    </mat-toolbar>
    <mat-toolbar *ngIf="!(appState.loggedIn$ | async)">
  <span>Zebrafish Facility Manager for
    {{appState.getState('facilityName')}}</span>
      <span class="fill-remaining-space"></span>
      <button mat-button (click)="login()">Login</button>
    </mat-toolbar>
  `,
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
