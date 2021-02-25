import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {LoaderService} from '../../../loader.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserDTO} from '../../UserDTO';
import {Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {UserAdminService} from '../user-admin.service';
import {debounceTime} from 'rxjs/operators';
import {ScreenSizes} from '../../../helpers/screen-sizes';
import {UserFilter} from '../user-filter';
import {AppStateService} from '../../../app-state.service';

@Component({
  selector: 'app-user-selector',
  template: `
    <div fxLayout="column" fxLayoutGap="20px">
      <!-- The Filter Part -->
      <span class="zf-sub-title">User Filter</span>
      <form [formGroup]="mfForm">
        <div fxLayout="column">
          <mat-form-field>
            <label>
              <input formControlName="text" matInput type="text" placeholder="Search text fields">
            </label>
            <button *ngIf="mfForm.get('text').value" mat-button mat-icon-button matSuffix type="button"
                    (click)="mfForm.get('text').setValue('')">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
          <mat-checkbox formControlName="activeOnly" color="primary">Active users</mat-checkbox>
          <mat-checkbox formControlName="inactiveOnly" color="primary">Inactive users</mat-checkbox>
          <mat-checkbox *ngIf="!appState.facilityConfig.hidePI"
                        formControlName="piOnly" color="primary">Primary Investigators
          </mat-checkbox>
          <mat-checkbox formControlName="researcherOnly" color="primary">Researchers</mat-checkbox>
          <mat-checkbox formControlName="isLoggedIn" color="primary">Logged In</mat-checkbox>
        </div>
      </form>
      <!-- The Filtered List part -->
      <div class="zf-sub-title">Filtered Users List</div>
      <ng-container *ngIf="service.filteredList.length > 0">
        <mat-selection-list #items dense [multiple]="false"
                            (selectionChange)="onSelect(items.selectedOptions.selected[0]?.value)">
          <mat-list-option *ngFor="let item of service.filteredList"
                           [value]="item"
                           [selected]="service.selected?.id === item.id"
                           class="zf-selection-item"
                           [class.selected]="service.selected && service.selected.id === item.id">
            <div mat-line>
              <div class="zf-mini-title">
                {{item.email}}
              </div>
            </div>
            <div *ngIf="item.name" class="zf-mini-row" mat-line>{{item.name}}</div>
            <div *ngIf="item.username" class="zf-mini-row" mat-line>Username: {{item.username}}</div>
          </mat-list-option>
        </mat-selection-list>
      </ng-container>
      <div *ngIf="service.filteredList.length == 0">
        <p>No users match the current filter.</p>
        <p>Try relaxing the filter criteria. </p>
      </div>
    </div>
  `,
})
export class UserSelectorComponent implements OnInit {
  ScreenSizes = ScreenSizes;
  @Output() selected = new EventEmitter<UserDTO>();

  // Build the filter form.
  mfForm = this.fb.group(this.service.filter);

  users: UserDTO[] = [];
  constructor(
    public appState: AppStateService,
    private readonly loader: LoaderService,
    private snackBar: MatSnackBar,
    private router: Router,
    public service: UserAdminService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    // any time a filter value changes, reapply the filter.
    this.mfForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.service.applyFilter(new UserFilter(this.mfForm.value));
    });
    this.service.applyFilter(new UserFilter(this.mfForm.value));
  }

  // when the user clicks on a user, go view it
  onSelect(instance: UserDTO | null) {
    this.selected.emit(instance);
    this.service.select(instance);
    this.router.navigateByUrl('user_admin/view/' + instance.id);
  }


}
