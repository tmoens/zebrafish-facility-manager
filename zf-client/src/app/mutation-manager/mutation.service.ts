import {Inject, Injectable} from '@angular/core';
import {LoaderService} from '../loader.service';
import {BehaviorSubject} from 'rxjs';
import {MutationFilter} from './mutation-filter';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FieldOptions} from '../helpers/field-options';
import {ZFGenericService} from '../zf-generic/zfgeneric-service';
import {Mutation} from './mutation';
import * as XLSX from 'xlsx';
import {AppStateService, ZFToolStates} from '../app-state.service';
import {plainToClass} from "class-transformer";
import {TransgeneFilter} from "../transgene-manager/transgene-filter";
import {Transgene} from "../transgene-manager/transgene";
import {ZFTypes} from "../helpers/zf-types";

/**
 * This is the model for mutation information displayed in the GUI.
 *
 * It is primarily a minor specialization of the generic service class.
 */

@Injectable({
  providedIn: 'root'
})
export class MutationService extends ZFGenericService<Mutation, Mutation, MutationFilter> {

  public spermFreezeOptions = ['DONE', 'NEVER', 'TODO'];

  // This is a cache that is used in several places.
  // It is only refreshed when the user performs some operation that will
  // change the content of the cache.
  // TODO it probably should refresh automatically periodically.
  private _all$: BehaviorSubject<Mutation[]> = new BehaviorSubject<Mutation[]>([]);
  get all(): Mutation[] { return this._all$.value; }

  constructor(
    private readonly loaderForGeneric: LoaderService,
    private snackBarForGeneric: MatSnackBar,
    private appStateServiceX: AppStateService,
  ) {
    super(ZFTypes.MUTATION, loaderForGeneric, snackBarForGeneric, appStateServiceX);
    this.appStateServiceX.loggedIn$.subscribe( (loggedIn: boolean) => {
      if (loggedIn) {
        this.initialize();
      }
    })
  }

  initialize() {
    const storedFilter  = this.appStateServiceX.getToolState(ZFTypes.MUTATION, ZFToolStates.FILTER);
    if (storedFilter) {
      this.setFilter(storedFilter);
    } else {
      const filter = plainToClass(MutationFilter, {});
      console.log(ZFTypes.MUTATION + ' empty filter: ' + JSON.stringify(filter));
      this.setFilter(filter);
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

  // Data comes from the server as a plain dto, this just converts to the corresponding class
  convertSimpleDto2Class(dto): any {
    return plainToClass(Mutation, dto);
  }

  // Data comes from the server as a dto, this just converts to the corresponding class
  convertFullDto2Class(dto): any {
    return plainToClass(Mutation, dto);
  }

  refresh() {
    super.refresh();
    this.loadAllMutations();
  }

  loadAllMutations() {
    this.loader.getFilteredList(ZFTypes.MUTATION, {}).subscribe((data) => {
      this._all$.next(data.map(m => this.convertSimpleDto2Class(m)));
    });
  }

  nameIsInUse(name: string): boolean {
    return this._fieldOptions.options.name.includes(name);
  }

  toExcel() {
    const wb = XLSX.utils.book_new();
    const mutationSheet = XLSX.utils.json_to_sheet(this.filteredList.map((m: Mutation) => {
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
