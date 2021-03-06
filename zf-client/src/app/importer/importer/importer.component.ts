import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {ZFTool} from '../../helpers/zf-tool';
import {ZFTypes} from '../../helpers/zf-types';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-importer',
  template: `
    <div fxLayout="row" fxLayoutAlign="center" *ngIf="authService.loggedIn$ | async">
      <div class="zf-full-width">
        <mat-toolbar color="primary">
          Importer - Never use on a live system
          <span class="fill-remaining-space"></span>
          <div>
            <button mat-button [matMenuTriggerFor]="importMenu">
              <mat-icon>more_vert</mat-icon>
              Things to import
            </button>
          </div>
        </mat-toolbar>
        <app-excel-importer [zfType]="typeToImport"></app-excel-importer>
      </div>
    </div>
    <mat-menu #importMenu="matMenu">

      <button mat-menu-item zfmHideUnauthorized="admin" (click)="typeToUpload(ZFTypes.STOCK)">
        <mat-icon>upload</mat-icon>
        <span>Upload Stocks</span>
      </button>

      <button mat-menu-item zfmHideUnauthorized="admin" (click)="typeToUpload(ZFTypes.MUTATION)">
        <mat-icon>upload</mat-icon>
        <span>Upload Mutations</span>
      </button>

      <button mat-menu-item zfmHideUnauthorized="admin" (click)="typeToUpload(ZFTypes.TRANSGENE)">
        <mat-icon>upload</mat-icon>
        <span>Upload Transgenes</span>
      </button>

      <button mat-menu-item zfmHideUnauthorized="admin" (click)="typeToUpload(ZFTypes.USER)">
        <mat-icon>upload</mat-icon>
        <span>Upload Users</span>
      </button>

      <button mat-menu-item zfmHideUnauthorized="admin" (click)="typeToUpload(ZFTypes.TANK)">
        <mat-icon>upload</mat-icon>
        <span>Upload Tanks</span>
      </button>
    </mat-menu>
  `,
  styleUrls: ['./importer.component.scss']
})
export class ImporterComponent implements OnInit {
  ZFTypes = ZFTypes;
  typeToImport: ZFTypes;

  constructor(
    public appState: AppStateService,
    public authService: AuthService,
  ) {
  }

  ngOnInit(): void {
    this.appState.setActiveTool(ZFTool.IMPORT_TOOL);
  }

  typeToUpload(zfType: ZFTypes) {
    this.typeToImport = zfType;
  }
}

