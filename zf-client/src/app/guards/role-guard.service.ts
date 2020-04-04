import {ActivatedRouteSnapshot, CanActivate, Router} from "@angular/router";
import {AppStateService} from "../app-state.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Injectable} from "@angular/core";
import {CONFIRM_MESSAGE_DURATION} from "../constants";

@Injectable()
export class RoleGuardService implements CanActivate {
  constructor(
    public appStateService: AppStateService,
    public router: Router,
    public snackBar: MatSnackBar,
  ) {  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // first check for login
    if (!this.appStateService.isAuthenticated) {
      this.appStateService.intendedPath = location.pathname;
      this.router.navigateByUrl('/splash');
      return false;
    }
    // so, the user is logged in - does she have a role that will allow her to do the navigation?
    if (!this.appStateService.canPerformRole(route.data.permittedRole)) {
      this.snackBar.open('No, you can not do that', null, {duration: CONFIRM_MESSAGE_DURATION});
      return false;
    }
    return true;
  }
}
