import {Component, OnInit} from '@angular/core';
import {LoaderService} from "../../loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppStateService} from "../../app-state.service";
import {UserDTO} from "../../common/user/UserDTO";
import {Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {UserAdminService} from "../user-admin.service";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'app-user-selector',
  template: `
    <div fxFlex fxLayout="column" class="zf-container">
      <!-- The Filter Part -->
      <div>
        <H4>User Filter</H4>
        <form fxLayout="column" [formGroup]="mfForm">
          <mat-form-field>
            <input matInput type="text" placeholder="Search all fields" formControlName="filter">
            <button mat-button matSuffix mat-icon-button (click)="clearFormControl('filter')">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>
        </form>
      </div>

      <!-- The Filtered List part -->
      <div fxFlex style="padding-right: 2px">
        <div *ngIf="service.users.length > 0">
          <h4>Filtered List</h4>
          <mat-list role="list" class="zf-selection-list" dense style="max-height: 550px">
            <mat-list-item class="zf-selection-item" role="listitem" style="height: 30px"
                           *ngFor="let item of service.users"
                           [class.selected]="service.selected && item.id === this.service.selected.id"
                           (click)="onSelect(item)">
              {{item.email}}
            </mat-list-item>
          </mat-list>
        </div>
        <div *ngIf="service.users.length == 0">
          <P>No users match the current filter, try relaxing the filter criteria. </P>
        </div>
      </div>
    </div>
  `,
})
export class UserSelectorComponent implements OnInit {
  filter = { filter: null};
  mfForm = this.fb.group(this.filter);

  users: UserDTO[] = [];
  constructor(
    private readonly loader: LoaderService,
    private snackBar: MatSnackBar,
    private appStateService: AppStateService,
    private router: Router,
    private fb: FormBuilder,
    public service: UserAdminService,

  ) { }

  ngOnInit(): void {
    // any time a filter value changes, reapply the filter.
    this.mfForm.valueChanges.pipe(debounceTime(300))
      .subscribe(() => this.service.setFilterAndApplyFilter(this.mfForm.value));
  }


  clearFormControl(name: string) {
    this.mfForm.get(name).setValue(''); // which will cause the filter to reapply.
  }

  // when the user clicks on a user, go view it
  onSelect(instance: UserDTO | null) {
    this.service.select(instance);
    this.router.navigate(['user_admin/view/' + instance.id]);
  }


}
