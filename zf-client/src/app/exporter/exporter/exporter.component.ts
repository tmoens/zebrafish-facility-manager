import { Component, OnInit } from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {AuthService} from '../../auth/auth.service';
import {TransgeneService} from '../../transgene-manager/transgene.service';
import * as XLSX from 'xlsx';
import {WorkBook, WorkSheet} from 'xlsx';
import {MutationService} from '../../mutation-manager/mutation.service';
import {StockService} from '../../stock-manager/stock.service';
import {ZFTool} from '../../helpers/zf-tool';
import {UserAdminService} from '../../auth/user-admin/user-admin.service';
import {TankService} from '../../tank-manager/tank.service';

@Component({
  selector: 'app-exporter',
  template: `
    <div fxLayout="row" fxLayoutAlign="center" *ngIf="authService.loggedIn$ | async">
      <div class="zf-full-width">
        <mat-toolbar color="primary">
          Stockbook Exporter
        </mat-toolbar>
      </div>
    </div>
    <div fxLayout="row" fxLayoutAlign="center">
      <mat-card style="max-width: 800px">
        <mat-card-content>
          <H2 *ngIf="fetchingStocks">
            <mat-icon>downloading</mat-icon>
            Fetching Stocks & swimmers
          </H2>
          <H2 *ngIf="!fetchingStocks">
            <mat-icon>done</mat-icon>
            Stocks and swimmers downloaded
          </H2>
          <H2 *ngIf="fetchingTransgenes">
            <mat-icon>downloading</mat-icon>
            Fetching Transgenes
          </H2>
          <H2 *ngIf="!fetchingTransgenes">
            <mat-icon>done</mat-icon>
            Transgenes downloaded
          </H2>
          <H2 *ngIf="fetchingMutations">
            <mat-icon>downloading</mat-icon>
            Fetching Mutations
          </H2>
          <H2 *ngIf="!fetchingMutations">
            <mat-icon>done</mat-icon>
            Mutations downloaded
          </H2>
          <H2 *ngIf="fetchingPeople">
            <mat-icon>downloading</mat-icon>
            Fetching People
          </H2>
          <H2 *ngIf="!fetchingPeople">
            <mat-icon>done</mat-icon>
            People (Users/PIs/Researchers) downloaded
          </H2>
          <H2 *ngIf="fetchingTanks">
            <mat-icon>downloading</mat-icon>
            Fetching Tanks
          </H2>
          <H2 *ngIf="!fetchingTanks">
            <mat-icon>done</mat-icon>
            Tanks downloaded
          </H2>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ExporterComponent implements OnInit {
  fetchingStocks = true;
  fetchingTransgenes = true;
  fetchingMutations = true;
  fetchingPeople = true;
  fetchingTanks = true;
  constructor(
    public appState: AppStateService,
    public authService: AuthService,
    public transgeneService: TransgeneService,
    public mutationService: MutationService,
    public stockService: StockService,
    public userAdminService: UserAdminService,
    public tankService: TankService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.appState.setActiveTool(ZFTool.EXPORT_TOOL);

    const wb: WorkBook = await this.stockService.getExportWorkbook()
    this.fetchingStocks = false;

    const transgeneWorksheet: WorkSheet = this.transgeneService.getExportWorksheet();
    XLSX.utils.book_append_sheet(wb, transgeneWorksheet, 'Transgenes');
    this.fetchingTransgenes = false;

    const mutationWorksheet: WorkSheet = this.mutationService.getExportWorksheet();
    XLSX.utils.book_append_sheet(wb, mutationWorksheet, 'Mutations');
    this.fetchingMutations = false;

    const personWorksheet: WorkSheet = await this.userAdminService.getExportWorkSheet();
    XLSX.utils.book_append_sheet(wb, personWorksheet, 'People')
    this.fetchingPeople = false;

    const tankWorksheet: WorkSheet = await this.tankService.getExportWorksheet();
    XLSX.utils.book_append_sheet(wb, tankWorksheet, 'Tanks')
    this.fetchingTanks = false;

    const now = Date().toString();
    XLSX.writeFile(wb, 'Zebrafish Stockbook ' + now + '.xlsx');
  }

}
