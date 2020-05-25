import {Injectable} from '@angular/core';
import {LoaderService} from '../loader.service';
import {MutationFilter} from './mutation-filter';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FieldOptions} from '../helpers/field-options';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import * as XLSX from 'xlsx';
import {AppStateService, ZFToolStates} from '../app-state.service';
import {plainToClass} from "class-transformer";
import {ZFTypes} from "../helpers/zf-types";
import {Router} from "@angular/router";
import {AuthService} from "../auth/auth.service";
import {MutationDto} from "./mutation-dto";

/**
 * This is the model for mutation information displayed in the GUI.
 *
 * It is primarily a minor specialization of the generic service class.
 */

@Injectable({
  providedIn: 'root'
})
export class MutationService extends ZFGenericService<MutationDto, MutationDto, MutationFilter> {

  public spermFreezeOptions = ['DONE', 'NEVER', 'TODO'];

  constructor(
    private readonly loader: LoaderService,
    private snackBar: MatSnackBar,
    private appState: AppStateService,
    private authService: AuthService,
    private router: Router,
  ) {
    super(ZFTypes.MUTATION, loader, snackBar, appState, authService, router);
    this.authService.loggedIn$.subscribe((loggedIn: boolean) => {
      if (loggedIn) {
        this.initialize();
      }
    })
  }

  initialize() {
    const storedFilter = this.appState.getToolState(ZFTypes.MUTATION, ZFToolStates.FILTER);
    if (storedFilter) {
      this.setFilter(plainToClass(MutationFilter, storedFilter));
    } else {
      this.setFilter(plainToClass(MutationFilter, {}));
    }

    this._fieldOptions = new FieldOptions({
      'researcher': [],
      'name': [],
      'gene': [],
      'screenType': [],
      'mutationType': [],
    });
    this.refresh();
  }

  nameIsInUse(name: string): boolean {
    return this._fieldOptions.options.name.includes(name);
  }

  nicknameIsInUse(nickname: string, exceptingId: number): boolean {
    for (const t of this.all) {
      if (t.id !== exceptingId && t.nickname === nickname) {
        return true;
      }
    }
    return false;
  }

  // This is used to populate an autocomplete field of mutations
  getListFilteredByString(searchString: string): MutationDto[] {
    return this.all.filter((m: MutationDto) => {
      return(
        (m.gene && m.gene.includes(searchString)) ||
        (m.name && m.name.includes(searchString)) ||
        (m.nickname && m.nickname.includes(searchString)));
    });
  }


  toExcel() {
    const wb = XLSX.utils.book_new();
    const mutationSheet = XLSX.utils.json_to_sheet(this.filteredList.map((m: MutationDto) => {
      return {Allele: m.name, Gene: m.gene, 'Alt Gene': m.alternateGeneName, Researcher: m.researcher,
        'AA Change': m.aaChange, 'BP Change': m.actgChange, Plan: m.spermFreezePlan, Frozen: m.vialsFrozen,
        Comment: m.comment, Phenotype: m.phenotype, 'Morphant Phenotype': m.morphantPhenotype};
    }));
    mutationSheet['!cols'] = [ {wch: 10}, {wch: 10}, {wch: 16}, {wch: 13}, {wch: 12}, {wch: 12},
      {wch: 8}, {wch: 8}, {wch: 50}, {wch: 50}, {wch: 50}];
    XLSX.utils.book_append_sheet(wb, mutationSheet, 'Mutations');

    const filterSheet = XLSX.utils.aoa_to_sheet([
      ['Filter used to generate this sheet'],
      [],
      ['Gene', this.filter.gene],
      ['Researcher', this.filter.researcher],
      ['Mutation Type', this.filter.mutationType],
      ['Screen Type', this.filter.screenType],
      ['Sperm Freeze', this.filter.spermFreeze],
      ['Owned Mutations', !!(this.filter.ownedMutationsOnly)],
      ['Free Text', this.filter.freeText],
    ]);
    filterSheet['!cols'] = [ {wch: 14}, {wch: 30}];
    XLSX.utils.book_append_sheet(wb, filterSheet, 'Filter');

    // const now = moment().('YYYY-MM-DD-HH-mm-ss');
    const now = new Date().toISOString();
    XLSX.writeFile(wb, 'Mutations-' + now + '.xlsx');
  }
}
