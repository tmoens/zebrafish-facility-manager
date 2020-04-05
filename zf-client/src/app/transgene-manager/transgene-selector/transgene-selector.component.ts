import {Component, OnInit} from '@angular/core';
import {TransgeneService} from '../transgene.service';
import {AbstractControl, FormBuilder} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';
import {TransgeneFilter} from '../transgene-filter';
import {Router} from '@angular/router';
import {Transgene} from '../transgene';

@Component({
  selector: 'app-transgene-selector',
  template: `
    <div fxFlex fxLayout="column" class="zf-container">
      <!-- The Filter Part -->
      <div>
        <H4>Transgene Filter</H4>
        <form fxLayout="column" [formGroup]="mfForm">
          <mat-form-field>
            <input matInput type="text" placeholder="Search all fields" formControlName="text">
            <button mat-button matSuffix mat-icon-button *ngIf="getFC('text').value"
                    (click)="clearFormControl('text')">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
        </form>
      </div>

      <!-- The Filtered List part -->
      <div fxFlex style="padding-right: 2px">
        <div *ngIf="service.filteredList.length > 0">
          <h4>Filtered List</h4>
          <mat-list role="list" class="zf-selection-list" dense style="max-height: 550px">
            <mat-list-item class="zf-selection-item" role="listitem" style="height: 30px"
                           *ngFor="let item of service.filteredList"
                           [class.selected]="service.selected && item.id === service.selected.id"
                           matTooltip="{{item.tooltip}}" matTooltipClass="ttnl"
                           (click)="onSelect(item)">
              {{item.fullName}}
            </mat-list-item>
          </mat-list>
        </div>
        <div *ngIf="service.filteredList.length == 0">
          <P>No transgenes match the current filter, try relaxing the filter criteria. </P>
        </div>
      </div>
    </div>
  `,
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
