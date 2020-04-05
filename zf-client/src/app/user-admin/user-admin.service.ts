import {Injectable} from '@angular/core';
import {LoaderService} from "../loader.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppStateService} from "../app-state.service";
import {UserDTO} from "../common/user/UserDTO";
import {UserFilter} from "./user-filter";
import {BehaviorSubject, Observable} from "rxjs";
import {ZFTypes} from "../helpers/zf-types";

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  filter: UserFilter;
  protected _selected$: BehaviorSubject<UserDTO> = new BehaviorSubject<UserDTO>(null);
  get selected$(): BehaviorSubject<UserDTO> { return this._selected$; }
  get selected(): UserDTO { return this.selected$.value; }

  users: UserDTO[] = [];

  constructor(
    private readonly loader: LoaderService,
    private snackBar: MatSnackBar,
    private appStateService: AppStateService,
  ) {
    this.setFilterAndApplyFilter(new UserFilter());
  }

  setFilterAndApplyFilter(filter: UserFilter) {
    this.setFilter(filter);
    this.applyFilter();
  }

  setFilter(filter: UserFilter) {
    this.filter = filter;
  }

  applyFilter() {
    this.loader.getFilteredList(ZFTypes.USER, this.filter)
      .subscribe((data: UserDTO[]) => {
        this.users = data;
        if (!this.selected && this.users.length > 0) {
          this.select(this.users[0]);
        }
      });
  }

  select(user: UserDTO) {
    this.selected$.next(user);
  }

  selectById(id: string) {
    if (this.selected.id === id) { return }
    this.loader.getInstance(ZFTypes.USER, id).subscribe((u: UserDTO) => this.select(u));
  }

  getById(id: string): Observable<UserDTO> {
    return this.loader.getInstance(ZFTypes.USER, id);
  }

  create(u: UserDTO) {
    this.loader.create(ZFTypes.USER, u)
      .subscribe((u: UserDTO) => {
        this.select(u);
        this.applyFilter();
      })
  }

  update(u: UserDTO) {
    this.loader.update(ZFTypes.USER, u)
      .subscribe((u: UserDTO) => {
        this.select(u);
        this.applyFilter();
      })
  }
}
