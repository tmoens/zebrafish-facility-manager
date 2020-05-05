import {Injectable} from '@angular/core';
import {UserDTO} from "../UserDTO";
import {BehaviorSubject, Observable} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppStateService} from "../../app-state.service";
import {AuthApiService} from "../auth-api.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  filter: string;
  public selected$: BehaviorSubject<UserDTO> = new BehaviorSubject<UserDTO>(null);
  get selected() { return this.selected$.getValue(); }

  // This keeps track of whether the user is editing or browsing
  private _inEditMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  get inEditMode$(): BehaviorSubject<boolean> { return this._inEditMode$; }

  users: UserDTO[] = [];

  constructor(
    private authApiService: AuthApiService,
    private message: MatSnackBar,
    private appState: AppStateService,
    private router: Router,
  ) {
    this.applyFilter('');
  }

  applyFilter(filter: string) {
    this.filter = filter;
    this.authApiService.getUsers(filter)
      .subscribe((data: UserDTO[]) => {
        if (data) {
          this.users = data;
        }
        if (!this.selected$.getValue() && this.users.length > 0) {
          this.select(this.users[0]);
        }
      });
  }

  select(user: UserDTO) {
    this.selected$.next(user);
  }

  selectById(id: string) {
    if (id) {
      this.authApiService.getInstance(id).subscribe((user: UserDTO) => {
        if (user) {
          this.select(user);
        } else {
          this.select(null);
        }
      });
    }
  }

  // the selection operation by id.
  // A bad id leaves us with nothing selected.
  // setSelectedId(id: string) {
  //   if (id) {
  //     this.appState.setToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID, id);
  //   } else {
  //     this.appState.removeToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID);
  //   }
  // }

  // loadSelected() {
  //   const id = this.appState.getToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID);
  //   if (id) {
  //     this.getById(id).subscribe((item: UserDTO) => {
  //       if (item) {
  //         this.select(item);
  //       } else {
  //         this.appState.removeToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID);
  //         this.select(null);
  //       }
  //     });
  //   } else {
  //     this.appState.removeToolState(ZFTypes.USER, ZFToolStates.SELECTED_ID);
  //     this.select(null);
  //   }
  // }

  getById(id: string): Observable<UserDTO> {
    return this.authApiService.getInstance(id);
  }

  create(u: UserDTO) {
    this.authApiService.create(u)
      .subscribe((u: UserDTO) => this.refilterAndNavigate(u));
  }

  delete(id: string) {
    this.authApiService.delete(id).subscribe((result) => {
      if (result) {
        this.message.open(result.name + ' deleted.', null, {duration: this.appState.confirmMessageDuration});
        this.refilterAndNavigate(null);
      }
    });
  }

  update(u: UserDTO) {
    this.authApiService.update(u)
      .subscribe((u: UserDTO) => {
        this.refilterAndNavigate(u);
      })
  }

  activate(u: UserDTO) {
    this.authApiService.activate(u)
      .subscribe((u: UserDTO) => {
        this.refilterAndNavigate(u);
      })
  }

  deactivate(u: UserDTO) {
    this.authApiService.deactivate(u)
      .subscribe((u: UserDTO) => {
        this.refilterAndNavigate(u);
      })
  }

  forceLogout(u: UserDTO) {
    this.authApiService.forceLogout(u)
      .subscribe((u: UserDTO) => {
        this.refilterAndNavigate(u);
      })
  }

  refilterAndNavigate(user?: UserDTO) {
    // In case any of the changes drop or add the user from or to the filtered set.
    if (user) { this.selectById(user.id); }
    this.applyFilter(this.filter);
    this.router.navigateByUrl('user_admin/view' + ((user) ? '/' + user.id : ''));
  }

  isEmailInUse(email: string): Observable<boolean> {
    return this.authApiService.isEmailInUse(email);
  }

  isUsernameInUse(email: string): Observable<boolean> {
    return this.authApiService.isUsernameInUse(email);
  }

  enterEditMode() {
    this.inEditMode$.next(true);
  }
  enterBrowseMode() {
    this.inEditMode$.next(false);
  }
}
