import {Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit, AfterContentInit, ElementRef, ViewChildren} from '@angular/core';
import {MutationService} from '../mutation.service';
import {Mutation} from '../mutation';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import {debounceTime, map, startWith} from 'rxjs/operators';
import {MutationFilter} from '../mutation-filter';

@Component({
  selector: 'app-mutation-selector',
  templateUrl: './mutation-selector.component.html',
  styleUrls: ['./mutation-selector.component.scss']
})
export class MutationSelectorComponent implements OnInit {
  // Build the filter form.
  mfForm = this.fb.group(this.service.filter);

  // These are arrays containing options for the various filter fields
  // They grow and shrink as the user types data into the filter fields.
  filteredGeneOptions: Observable<string[]>;
  filteredResearcherOptions: Observable<string[]>;
  filteredMutationTypeOptions: Observable<string[]>;
  filteredScreenTypeOptions: Observable<string[]>;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public service: MutationService,
  ) { }

  ngOnInit() {
    // any time a filter value changes, reapply the filter
    this.mfForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.service.setFilter(new MutationFilter(this.mfForm.value));
      this.service.applyFilter();
    });

    // Again for the addled brain: this bit just watches what the user has typed in
    // the researcher field and when it changes, it recalculates the set of remaining values
    // that kinda match what the user has typed.
    this.filteredResearcherOptions = this.mfForm.get('researcher').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('researcher', value))
    );

    this.filteredGeneOptions = this.mfForm.get('gene').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('gene', value))
    );

    this.filteredScreenTypeOptions = this.mfForm.get('screenType').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('screenType', value))
    );

    this.filteredMutationTypeOptions = this.mfForm.get('mutationType').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('mutationType', value))
    );
  }

  clearFormControl(name: string) {
    this.mfForm.get(name).setValue(''); // which will cause the filter to reapply.
  }

  onClearFilters() {
    this.mfForm.reset(); // which will cause the filter to reapply.
  }

  // When a mutation is selected we just tell the service (model).
  // Decision not to route.navigate to the mutation, let the
  // mutation manager decide what to do in any given context.
  onSelect(m: Mutation | null) {
    this.router.navigate(['mutation_manager/view/' + m.id]);
  }
}
