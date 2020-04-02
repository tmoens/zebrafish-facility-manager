import {Component, OnInit} from '@angular/core';
import {LoaderService, ZFTypes} from "../../loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppStateService} from "../../app-state.service";
import {UserDTO} from "../../common/user/UserDTO";
import {Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {UserAdminService} from "../user-admin.service";
import {debounceTime} from "rxjs/operators";

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.scss']
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
