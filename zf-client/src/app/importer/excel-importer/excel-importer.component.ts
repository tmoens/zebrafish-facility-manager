import {Component, Input, OnInit} from '@angular/core';
import * as XLSX from 'xlsx';
import {ParsingOptions} from 'xlsx';
import {ZFTypes} from '../../helpers/zf-types';
import {LoaderService} from '../../loader.service';
import {StockbookMigrator} from './stockbook-migrator';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
  selector: 'app-excel-importer',
  template: `
    <div fxLayout="column" *ngIf="zfType">
      <mat-toolbar class="zf-mini-toolbar">
        <span class="zf-title">{{zfType}} importer</span>
      </mat-toolbar>
      <button mat-button color="primary" (click)="openFileChooser()">
        <label disabled="!canSelectFile">Select {{zfType}} upload file...</label>
      </button>
      <input id="fileToImport" type="file" hidden (change)="fileSelected($event)">
      <div *ngIf="toDo > 0" fxLayout="row" fxLayoutAlign="space-between center">
        <div>Done: {{done}}</div>
        <div *ngIf="toDo < done">Loading</div>
        <div>To Do: {{toDo}}</div>
      </div>
      <mat-progress-bar *ngIf="toDo > 0" [value]="progress" mode="determinate"></mat-progress-bar>

      <div *ngIf="dtos.length > 1" class="zf-sub-title">Results:</div>
      <div *ngFor="let dto of dtos; let i = index" fxLayout="row">
        <div fxFlex="10">row: {{i + 2}}</div>
        <div fxFlex="15">id: {{dto.id}}</div>
        <div fxFlex="20" *ngIf="zfType === ZFTypes.TRANSGENE">{{dto.allele}}^{{dto.descriptor}}</div>
        <div fxFlex="15" *ngIf="zfType === ZFTypes.MUTATION">{{dto.gene}}^{{dto.name}}</div>
        <div fxFlex>{{dto.importResult}}</div>
      </div>
    </div>
  `,
  styleUrls: ['./excel-importer.component.scss']
})
export class ExcelImporterComponent implements OnInit {
  ZFTypes = ZFTypes;
  private _zfType: ZFTypes;

  @Input()
  get zfType(): ZFTypes {
    return this._zfType;
  }
  set zfType(zfType: ZFTypes) {
    this.dtos = [];
    this.toDo = 0;
    this.done = 0;
    this._zfType = (zfType);
  }

  // The dtos that we are trying to import
  dtos: any[];

  // Can't select a file while one is being processed
  canSelectFile = true;

  toDo: number;
  done: number;
  progress: number;
  filename: string;

  selectedFileName: string;

  constructor(
    private service: LoaderService,
  ) {
  }

  ngOnInit(): void {
    this.dtos = [];
  }

  /* Note to future self that cost me about three hours 2018-10-05.
   * This next bit is a work-around for the fact that angular buttons do not
   * mix well with <input type=file>, so the html has an angular button and
   * a hidden <input type=file>. When the button is pushed it calls this
   * function which programmatically clicks the file chooser which results
   * in the file chooser showing up.
   * Further note to self - if the Angular button label uses the
   * label-for="fileToUpload" attribute, then the Chrome browser is smart
   * enough to know what you are trying to do and it automatically pops up the
   * file chooser - meaning that it shows up twice.  Firefox is not so smart.
   * So do not use the label-for and both browsers work.
   */
  openFileChooser() {
    document.getElementById('fileToImport').click();
  }

  async fileSelected(event) {
    const selectedFile = event.target.files[0];
    this.filename = selectedFile.name;
    this.canSelectFile = false;
    const fileContent = await readFileAsArrayBuffer(selectedFile);
    const options: ParsingOptions = {type: "array"};
    const wb = XLSX.read(fileContent, options);

    // hand off stockbook migration task
    if (this.zfType === ZFTypes.STOCKBOOK_MIGRATION) {
      const stockbookMigrator: StockbookMigrator = new StockbookMigrator();
      stockbookMigrator.migrateStockbook(wb);
      return;
    }


    const ws = wb.Sheets[wb.SheetNames[0]];
    this.dtos = XLSX.utils.sheet_to_json(ws);
    this.toDo = this.dtos.length;
    this.done = 0;
    for (const dto of this.dtos) {
      const response = await this.service.import(this.zfType, dto)
        .pipe(
          catchError(err => {
            dto.importResult = 'Failure: ' + err.error.message;
            return of(null);
          })
        )
        .toPromise();
      if (response) {
        dto.id = response.id;
        dto.importResult = 'Success';
      }
      this.done = this.done + 1;
      this.progress = this.done / this.toDo * 100;
    }

    // Build an results workbook
    this.resultsToExcel(this.dtos);
    this.canSelectFile = true;
  }

  resultsToExcel(list) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(list);
    XLSX.utils.book_append_sheet(wb, ws, `Import ${this.zfType}s `);

    const now = new Date().toISOString();
    XLSX.writeFile(wb, `Import${this.zfType}Results-${now}.xlsx`);
  }
}
const readFileAsArrayBuffer = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(temporaryFileReader.error);
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsArrayBuffer(inputFile);
  });
}

