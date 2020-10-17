import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl} from '@angular/forms';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {StockService} from '../stock.service';
import {StockFilter} from './stock-filter';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {StockDto} from "../dto/stock-dto";
import {AppStateService} from "../../app-state.service";
import {MutationService} from "../../mutation-manager/mutation.service";
import {MutationDto} from "../../mutation-manager/mutation-dto";
import {TransgeneDto} from "../../transgene-manager/transgene-dto";
import {TransgeneService} from "../../transgene-manager/transgene.service";
import {ZfGenericDto} from "../../zf-generic/zfgeneric-dto";

/**
 * A two-part component: a filter for stocks and a list of filtered stocks.
 * This is primarily a GUI component, the filter and the filtered list
 * are maintained in the stock service.
 *
 * Why?
 * 1) Because other aspects of the stock GUI may wish to change the filter
 * 2) Because this is not the only way in which a stock can become selected.
 */

@Component({
  selector: 'app-stock-selector',
  templateUrl: './stock-selector.component.html',
  styleUrls: ['./stock-selector.component.scss']
})
export class StockSelectorComponent implements OnInit {
  @Output() selected = new EventEmitter<StockDto>();
  // This is the id of the stock that the mouse is currently over
  // The GUI uses this to present a little extra info about that stock
  focusId: number;

  // This is the id of the mutation the mouse is currently over in the mutation filter
  // autocomplete field.  It allows the GUI to present a little extra info about that mutation.
  mutationInFocus: number;

  // same for transgenes
  transgeneInFocus: number;

  // Build the filter form.
  mfForm = this.fb.group(this.service.filter);

  // The mutation and transgene parts of the filter form are not simply
  // strings.  They are autocomplete lists of mutations and filters, so
  // we add a couple of form controls for them.
  mutationFilterFC: FormControl = new FormControl();
  transgeneFilterFC: FormControl = new FormControl();

  filteredResearcherOptions: Observable<string[]>;
  filteredMutationOptions: MutationDto[];
  filteredTransgeneOptions: TransgeneDto[];

  constructor(
    public appState: AppStateService,
    private router: Router,
    private fb: FormBuilder,
    public service: StockService,
    private mutationService: MutationService,
    private transgeneService: TransgeneService,
  ) {
  }

  ngOnInit() {
    // any time a filter value changes, reapply it
    this.mfForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.getFilteredStocks();
      });

    // when the user types something in the researcher part of the filter,
    // change the auto-complete options available.
    this.filteredResearcherOptions = this.mfForm.get('researcher').valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this.service.fieldOptions.filterOptionsContaining('researcher', value))
    );

    // the mutation filter can be a specific MutationDto or a string.
    this.mutationFilterFC.valueChanges.pipe(
      startWith(''),
      debounceTime(300)).subscribe((value: string | MutationDto) => {
        if (typeof(value) === 'string') {
          // if the filter is a string get a list of mutations that match the string
          // to be used as auto-complete options for the mutation filter.
          this.filteredMutationOptions = this.mutationService.getListFilteredByString(value);
        }
        this.getFilteredStocks();
      }
    );

    // the transgene filter can be a specific TransgeneDTO or a string.
    this.transgeneFilterFC.valueChanges.pipe(
      startWith(''),
      debounceTime(300)).subscribe((value: string | TransgeneDto) => {
        if (typeof(value) === 'string') {
          // if the filter is a string get a list of transgenes that match the string
          // to be used as auto-complete options for the transgene filter.
          this.filteredTransgeneOptions = this.transgeneService.getListFilteredByString(value);
        }
        this.getFilteredStocks();
      }
    );
  }

  getFilteredStocks() {
    const stockFilter: StockFilter = new StockFilter(this.mfForm.value);
    if (this.mutationFilterFC.value) {
      if (typeof (this.mutationFilterFC.value) === 'string') {
        stockFilter.mutation = this.mutationFilterFC.value;
      } else {
        stockFilter.mutationId = this.mutationFilterFC.value.id;
      }
    }
    if (this.transgeneFilterFC.value) {
      if (typeof (this.transgeneFilterFC.value) === 'string') {
        stockFilter.transgene = this.transgeneFilterFC.value;
      } else {
        stockFilter.transgeneId = this.transgeneFilterFC.value.id;
      }
    }
    this.service.setFilter(stockFilter);
    this.service.applyFilter();
  }

  getFC(name: string): AbstractControl {
    return this.mfForm.get(name);
  }

  clearFormControl(controlName: string) {
    this.getFC(controlName).setValue(''); // which will cause the filter to reapply.
  }

  clearMutationFilter() {
    this.mutationFilterFC.setValue('')
  }

  clearTransgeneFilter() {
    this.transgeneFilterFC.setValue('')
  }

  onClearFilters() {
    this.clearTransgeneFilter();
    this.clearMutationFilter();
    this.mfForm.reset(); // which will cause the filter to reapply.
  }

  // when the user clicks on a transgene,
  // a) emit an event.  Right now the only consumer of this event is the containing sidenav.
  //    If the selector is toggled open (as opposed to being fixed in place), it needs to
  //    toggle itself closed before
  // b) navigate to view the selected transgene
  onSelect(instance: ZfGenericDto | null) {
    this.selected.emit(instance as StockDto);
    this.router.navigate(['stock_manager/view/' + instance.id]).then();
  }

  onPreselect(id) {
    this.focusId = id;
  }
}

