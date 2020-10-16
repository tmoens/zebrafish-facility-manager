import {Injectable} from '@angular/core';
import {LoaderService} from '../loader.service';
import {TransgeneFilter} from './transgene-filter';
import {FieldOptions} from '../helpers/field-options';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import * as XLSX from 'xlsx';
import {AppStateService, ZFToolStates} from '../app-state.service';
import {MatSnackBar} from "@angular/material/snack-bar";
import {plainToClass} from "class-transformer";
import {ZFTypes} from "../helpers/zf-types";
import {Router} from "@angular/router";
import {AuthService} from "../auth/auth.service";
import {TransgeneDto} from "./transgene-dto";

/**
 * This is the model for transgene information displayed in the GUI.
 *
 * It is primarily a minor specialization of the generic service class.
 */

@Injectable({
  providedIn: 'root'
})
export class TransgeneService extends ZFGenericService<TransgeneDto, TransgeneDto, TransgeneFilter> {

  public spermFreezeOptions = ['DONE', 'NEVER', 'TODO'];

  constructor(
    private readonly loader: LoaderService,
    private snackBar: MatSnackBar,
    private appState: AppStateService,
    private authService: AuthService,
    private router: Router,
  ) {
    super(ZFTypes.TRANSGENE, loader, snackBar, appState, authService, router);
    this.authService.loggedIn$.subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.initialize();
      }
    })
  }

  initialize() {
    const storedFilter = this.appState.getToolState(ZFTypes.TRANSGENE, ZFToolStates.FILTER);
    if (storedFilter) {
      this.setFilter(plainToClass(TransgeneFilter, storedFilter));
    } else {
      this.setFilter(plainToClass(TransgeneFilter, {}));
    }

    this._fieldOptions = new FieldOptions({
      'nameValidation': [],
      'source': [],
    });
    this.refresh();
  }

  // convert a plain (json) object to a "Full" DTO
  // I could not figure out how to do this in the generic service class
  plain2FullClass(plain): TransgeneDto {
    return plainToClass(TransgeneDto, plain);
  }

  plain2RegularClass(plain): TransgeneDto {
    return plainToClass(TransgeneDto, plain);
  }


  // This is used to populate a autocomplete field of transgenes
  getListFilteredByString(searchString: string): TransgeneDto[] {
    return this.all.filter((t: TransgeneDto) => {
      const ss: string = searchString.toLowerCase();
      return (
        (t.descriptor && t.descriptor.toLowerCase().includes(ss)) ||
        (t.allele && t.allele.toLowerCase().includes(ss)) ||
        (t.nickname && t.nickname.toLowerCase().includes(ss)));
    });
  }


  uniquenessValidator(name: string): boolean {
    return this._fieldOptions.options.nameValidation.includes(name);
  }

  nicknameIsInUse(nickname: string, exceptingId: number): boolean {
    if (nickname === null) {
      return false;
    }
    for (const t of this.all) {
      if (t.id !== exceptingId && t.nickname === nickname) {
        return true;
      }
    }
    return false;
  }

  toExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.all.map((m: TransgeneDto) => {
      return {Descriptor: m.descriptor, Allele: m.allele, Source: m.source, Plasmid: m.plasmid, Comment: m.comment};
    }));
    XLSX.utils.book_append_sheet(wb, ws, 'Transgenes');
    ws['!cols'] = [ {wch: 35}, {wch: 8}, {wch: 24}, {wch: 50}, {wch: 50}];

    let data: string [][];
    if (!this.filter || this.filter.isEmpty()) {
      data = [
        ['This workbook lists all transgenes.']
      ];
    } else {
      data = [
        ['This book lists any transgene containing the string: "' + this.filter.text +
        '" in the allele, descriptor, source, plasmid or comment.'],
      ];
    }
    const filterSheet = XLSX.utils.aoa_to_sheet(data);
    filterSheet['!cols'] = [{wch: 100}];
    XLSX.utils.book_append_sheet(wb, filterSheet, 'Filter');

    // const now = moment().format('YYYY-MM-DD-HH-mm-ss');
    const now = Date().toString();
    XLSX.writeFile(wb, 'Transgenes-' + now + '.xlsx');
  }

  dataCleanlinessReport() {
    super.dataCleanlinessReport(['source'], 'TransgeneDataCleanliness');
  }
}
