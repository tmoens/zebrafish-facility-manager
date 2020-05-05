import {ActivatedRouteSnapshot, CanActivate, Router} from "@angular/router";
import {AppStateService} from "../../app-state.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Injectable} from "@angular/core";
import {AuthService} from "../auth.service";

@Injectable()
export class RoleGuardService implements CanActivate {
  constructor(
    public appState: AppStateService,
    private authService: AuthService,
    public router: Router,
    public snackBar: MatSnackBar,
  ) {  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // first check for login
    if (!this.authService.isAuthenticated) {
      this.authService.intendedPath = location.pathname;
      this.router.navigateByUrl('/splash');
      return false;
    }
    // so, the user is logged in - does she have a role that will allow her to do the navigation?
    if (!this.authService.canPerformRole(route.data.permittedRole)) {
      this.snackBar.open('No, you can not do that', null,
        {duration: this.appState.errorMessageDuration});
      return false;
    }
    return true;
  }
}
