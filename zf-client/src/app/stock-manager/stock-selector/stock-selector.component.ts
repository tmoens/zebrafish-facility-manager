import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder} from '@angular/forms';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {StockService} from '../stock.service';
import {StockFilter} from './stock-filter';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {Stock} from '../stock';

/**
 * A two-part component: a filter for stocks and a list of filtered stocks.
 * This is primarily a GUI component, the filter and the filtered list
 * are maintained in the selected service.
 *
 * Why?
 * 1) Because other aspects of the selected GUI may wish to change the filter
 * 2) Because this is not the only way in which a selected can become selected.
 */

@Component({
  selector: 'app-stock-selector',
  templateUrl: './stock-selector.component.html',
  styleUrls: ['./stock-selector.component.scss']
})
export class StockSelectorComponent implements OnInit {

  mfForm = this.fb.group(this.service.filter);

  filteredResearcherOptions: Observable<string[]>;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public service: StockService,
  ) {
  }

  ngOnInit() {
    // any time a filter value changes, send the changed filter to the service.
    this.mfForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.service.setFilter(new StockFilter(this.mfForm.value));
    });

    // when the user types something in the researcher part of the filter,
    // change the auto-complete options available.
    this.filteredResearcherOptions = this.mfForm.get('researcher').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('researcher', value))
    );
  }

  getFC(name: string): AbstractControl {
    return this.mfForm.get(name);
  }

  clearFormControl(controlName: string) {
    this.getFC(controlName).setValue(''); // which will cause the filter to reapply.
  }

  onClearFilters() {
    this.mfForm.reset(); // which will cause the filter to reapply.
  }

  // Tell the service which Id is currently selected.
  onSelect(s: Stock | null) {
    this.router.navigate(['stock_manager/view/' + s.id]);
  }
}

