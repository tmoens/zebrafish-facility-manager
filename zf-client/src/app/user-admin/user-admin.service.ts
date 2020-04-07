import {Injectable} from '@angular/core';
import {LoaderService} from "../loader.service";
import {UserDTO} from "../common/user/UserDTO";
import {UserFilter} from "./user-filter";
import {BehaviorSubject, Observable} from "rxjs";
import {ZFTypes} from "../helpers/zf-types";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppStateService, ZFToolStates} from "../app-state.service";

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  filter: UserFilter;
  protected _selected$: BehaviorSubject<UserDTO> = new BehaviorSubject<UserDTO>(null);
  get selected$(): BehaviorSubject<UserDTO> {
    return this._selected$;
  }

  get selected(): UserDTO {
    return this.selected$.value;
  }

  users: UserDTO[] = [];

  constructor(
    private readonly loader: LoaderService,
    private readonly message: MatSnackBar,
    private readonly appState: AppStateService,
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

  // the selection operation by id.
  // A bad id leaves us with nothing selected.
  setSelectedId(id: string) {
    if (id) {
      this.appState.setToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID, id);
    } else {
      this.appState.removeToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID);
    }
  }

  loadSelected() {
    const id = this.appState.getToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID);
    if (id) {
      this.getById(id).subscribe((item: UserDTO) => {
        if (item) {
          this.select(item);
        } else {
          this.appState.removeToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID);
          this.select(null);
        }
      });
    } else {
      this.appState.removeToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID);
      this.select(null);
    }
  }

  selectByIdAndLoad(id: string) {
    this.setSelectedId(id);
    this.loadSelected();
  }

  // selectById(id: string) {
  //   if (this.selected.id === id) { return }
  //   this.loader.getInstance(ZFTypes.USER, id).subscribe((u: UserDTO) => this.select(u));
  // }

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

  delete(id: string) {
    this.loader.delete(ZFTypes.USER, id).subscribe((result) => {
      if (result) {
        this.message.open(result.name + ' deleted.', null, {duration: this.appState.confirmMessageDuration});
        this.selectByIdAndLoad(null);
        this.applyFilter();
      }
    });
  }

  update(u: UserDTO) {
    this.loader.update(ZFTypes.USER, u)
      .subscribe((u: UserDTO) => {
        this.select(u);
        this.applyFilter();
      })
  }
}
