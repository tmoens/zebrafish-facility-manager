import {Component, OnInit} from '@angular/core';
import {LoaderService} from "../../../loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserDTO} from "../../UserDTO";
import {Router} from "@angular/router";
import {FormControl} from "@angular/forms";
import {UserAdminService} from "../user-admin.service";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'app-user-selector',
  template: `
    <div fxLayout="column" class="zf-selector">
      <!-- The Filter Part -->
      <span class="zf-sub-title">User Filter</span>
      <mat-form-field >
        <input matInput type="text" placeholder="Search all fields" [formControl]="filterFC">
        <button mat-button matSuffix mat-icon-button (click)="clearFilter()">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
      <!-- The Filtered List part -->
      <div *ngIf="service.users.length > 0">
        <span class="zf-sub-title">Filtered List</span>
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
        <p>No users match the current filter.</p>
        <p>Try relaxing the filter criteria. </p>
      </div>
    </div>
  `,
})
export class UserSelectorComponent implements OnInit {
  filterFC: FormControl = new FormControl('');

  users: UserDTO[] = [];
  constructor(
    private readonly loader: LoaderService,
    private snackBar: MatSnackBar,
    private router: Router,
    public service: UserAdminService,

  ) { }

  ngOnInit(): void {
    // any time a filter value changes, reapply the filter.
    this.filterFC.valueChanges.pipe(debounceTime(300))
      .subscribe(() => this.service.applyFilter(this.filterFC.value));
  }


  clearFilter() {
    this.filterFC.setValue(''); // which will cause the filter to reapply.
  }

  // when the user clicks on a user, go view it
  onSelect(instance: UserDTO | null) {
    this.service.select(instance);
    this.router.navigateByUrl('user_admin/view');
  }


}
