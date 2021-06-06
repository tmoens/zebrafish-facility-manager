import {Injectable} from '@angular/core';
import {LoaderService} from '../loader.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StockFilter} from './stock-selector/stock-filter';
import {FieldOptions} from '../helpers/field-options';
import * as XLSX from 'xlsx';
import {map} from 'rxjs/operators';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import {Observable} from 'rxjs';
import {AppStateService, ZFToolStates} from '../app-state.service';
import {plainToClass} from 'class-transformer';
import {ZFTypes} from '../helpers/zf-types';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {StockDto} from './dto/stock-dto';
import {StockFullDto} from './dto/stock-full-dto';
import {MutationDto} from '../mutation-manager/mutation-dto';
import {TransgeneDto} from '../transgene-manager/transgene-dto';
import {WorkBook, WorkSheet} from 'xlsx';

/**
 * This is the model for stock information displayed in the GUI.
 *
 * It is primarily a specialization of the generic service class.
 *
 * However, stocks have many relationships the mutations and transgenes
 * do not, so it has significantly more extensions than the other
 * classes and services.
 */


@Injectable({
  providedIn: 'root'
})
export class StockService extends ZFGenericService<
  StockDto, StockFullDto, StockFilter> {

  constructor(
    private readonly loader: LoaderService,
    private message: MatSnackBar,
    private appState: AppStateService,
    private authService: AuthService,
    private router: Router,
  ) {
    super(ZFTypes.STOCK, loader, message, appState, authService, router);
    const storedFilter = this.appState.getToolState(ZFTypes.STOCK, ZFToolStates.FILTER);
    if (storedFilter) {
      const filter = plainToClass(StockFilter, storedFilter);
      this.setFilter(filter);
    } else {
      const filter = plainToClass(StockFilter, {});
      this.setFilter(filter);
    }
    this._fieldOptions = new FieldOptions({
    });

    // We cannot really initialize until the user logs in because we will not have the
    // authorization to go get the data we need from the server.  So we watch the login state
    // and trigger initialization when the user logs in.
    this.authService.loggedIn$.subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.initialize();
      }
    })
  }

  placeholder() {
  }

  // convert a plain (json) object to a StockFullDTO
  // I could not figure out how to do this in the generic service class
  plain2FullClass(plain): StockFullDto {
    return plainToClass(StockFullDto, plain);
  }

  plain2RegularClass(plain): StockDto {
    return plainToClass(StockDto, plain);
  }

  initialize() {
    this.refresh();
  }

  createSubStock(item: StockFullDto) {
    this.loader.createSubStock(item).subscribe((result: StockFullDto) => {
      if (result.id) {
        this.message.open(result.name + ' created.', null, {duration: this.appState.confirmMessageDuration});
        // It might seem right just to select the object you get back from the create call
        // rather than make another round trip to re-fetch the object from the server.
        // BUT the object you get back from the creation call is not reliable.  For
        // example, the "is Deletable" flag is not in the value returned here.
        // Also the new object may or may not meet the filter criteria and
        // therefore will or will not be in the filtered list.
        this.setSelectedId(result.id);
        this.refresh();
        this.router.navigateByUrl(this.appState.activeTool.route + '/view/' + result.id).then();
      }
    });
  }

  getByName(stockName: string): Observable<StockDto> {
    return this.loader.getByName(ZFTypes.STOCK, stockName).pipe(
      map(s => (s))
    );
  }

  // in the generic service the likelyNextName is a string.  But for stocks
  // the string will actually be a number.  So...
  get likelyNextStockNumber(): number {
    return Number(this.likelyNextName);
  }

  // To make the excel report happen, you gotta go get all stocks that meet the current filter
  getStockReport() {
    this.loader.getReport(ZFTypes.STOCK, this.filter)
      .subscribe((data) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        // Set the column widths - we just happen to know the columns (for now) are
        // Stock Description DOB Researcher Mother Father Mutations Transgenes Tanks
        ws['!cols'] = [ {wch: 8}, {wch: 30}, {wch: 20}, {wch: 9},
          {wch: 9}, {wch: 10}, {wch: 20}, {wch: 30}, {wch: 30}];
        XLSX.utils.book_append_sheet(wb, ws, 'Stocks');
        const now = new Date().toISOString().substring(0, 10);
        const ws2 = XLSX.utils.json_to_sheet([this.filter]);
        XLSX.utils.book_append_sheet(wb, ws2, 'Filter');
        XLSX.writeFile(wb, 'Stocks-' + now + '.xlsx');
      });
  }

  getAuditReport() {
    this.loader.getAuditReport()
      .subscribe((data) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        // Set the column widths - we just happen to know the columns (for now) are
        // TankName Rack Shelf Spigot Stock Count Comment
        ws['!cols'] = [{wch: 7}, {wch: 7}, {wch: 7}, {wch: 7},
          {wch: 7}, {wch: 7}, {wch: 40}];
        XLSX.utils.book_append_sheet(wb, ws, 'Stock Audit');
        // const now = moment().format('YYYY-MM-DD-HH-mm-ss');
        XLSX.writeFile(wb, 'Facility  Audit ' + 'now' + '.xlsx');
      });

  }

  getParentalMutations(): MutationDto[] {
    let r: MutationDto[] = [];
    if (this.selected.matStock && this.selected.matStock.mutations) {
      r = this.selected.matStock.mutations;
    }
    if (this.selected.patStock && this.selected.patStock.mutations) {
      r = r.concat(this.selected.patStock.mutations);
    }
    return r;
  }

  getParentalTransgenes(): TransgeneDto[] {
    let r: TransgeneDto[] = [];
    if (this.selected.matStock && this.selected.matStock.transgenes) {
      r = this.selected.matStock.transgenes;
    }
    if (this.selected.patStock && this.selected.patStock.transgenes) {
      r = r.concat(this.selected.patStock.transgenes);
    }
    return r;
  }

  getStockWalkerList(): Observable<any> {
    return this.loader.getTankWalkerList(this.filter)
  }

  async getExportWorkbook(): Promise<WorkBook> {
    const wb = XLSX.utils.book_new();
    const stockJSON = [];
    const swimmerJSON = [];

    const stockExportData: StockExportData[] = await this.loader.getExportData().toPromise();
    stockExportData.map((s: StockExportData) => {
      stockJSON.push({
        "Stock Number": s.name,
        "Description": s.description,
        "Allele Summary": s.alleleSummary,
        "Fertilization Date": s.fertilizationDate,
        Mom: (s.matStock) ? s.matStock.name : null,
        Dad: (s.patStock) ? s.patStock.name : null,
        "Into Nursery": s.countEnteringNursery,
        "Out of Nursery": s.countLeavingNursery,
        "Researcher": (s.researcherUser) ? s.researcherUser.username : null,
        "PI:": (s.piUser) ? s.piUser.username: null,
        Comment: s.comment,
      });
      s.swimmers.map((swimmer) => {
        swimmerJSON.push({
          "Stock Number": s.name,
          Tank: swimmer.tank.name,
          Count: swimmer.number,
          Comment: swimmer.comment,
        });
      })
    })

    const stockWS: WorkSheet = XLSX.utils.json_to_sheet(stockJSON);
    stockWS['!cols'] = [
      {wch: 12}, {wch: 35}, {wch: 40}, {wch: 10}, {wch: 8}, {wch: 8},
      {wch: 12}, {wch: 12}, {wch: 20}, {wch: 20},
      {wch: 40}];
    const swimmerWS: WorkSheet = XLSX.utils.json_to_sheet(swimmerJSON);
    swimmerWS['!cols'] = [ {wch: 12}, {wch: 8}, {wch: 8}, {wch: 40}];
    XLSX.utils.book_append_sheet(wb,stockWS, 'Stocks');
    XLSX.utils.book_append_sheet(wb,swimmerWS, 'Swimmers');
    console.log(JSON.stringify(stockExportData));
    return wb;
  }

}

class StockExportData {
  id: number;
  name: string;
  description?: string;
  fertilizationDate: string;
  comment: string;
  alleleSummary: string;
  countEnteringNursery: number;
  countLeavingNursery: number;
  matStock: {
    name: string;
  };
  patStock: {
    name: string;
  };
  swimmers: [
    {
      tankId: number;
      number: number;
      comment: string;
      tank: {
        name: string;
      }
    }
  ];
  researcherUser: {
    username: string;
  }
  piUser: {
    username: string;
  }
}
