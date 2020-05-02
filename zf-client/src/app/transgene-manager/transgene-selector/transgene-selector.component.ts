import {Component, OnInit} from '@angular/core';
import {TransgeneService} from '../transgene.service';
import {AbstractControl, FormBuilder} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {TransgeneFilter} from '../transgene-filter';
import {Router} from '@angular/router';
import {Transgene} from '../transgene';

@Component({
  selector: 'app-transgene-selector',
  templateUrl: 'transgene-selector.component.html',
})
export class TransgeneSelectorComponent implements OnInit {
  // Build the filter form.
  mfForm = this.fb.group(this.service.filter);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public service: TransgeneService,
  ) { }

  ngOnInit() {
    // any time a filter value changes, reapply the filter.
    this.mfForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.service.setFilter(new TransgeneFilter(this.mfForm.value));
      this.service.applyFilter();
    });
  }

  getFC(name: string): AbstractControl {
    return this.mfForm.get(name);
  }

  clearFormControl(name: string) {
    this.getFC(name).setValue(''); // which will cause the filter to reapply.
  }

  // when the user clicks on a transgene, go view it
  // This has a side-effect of causing the transgene to become selected.
  onSelect(instance: Transgene | null) {
    this.router.navigate(['transgene_manager/view/' + instance.id]);
  }
}
