import {Injectable} from "@angular/core";
import {ActivatedRoute, CanActivate, Router} from "@angular/router";
import {AppStateService} from "../app-state.service";
import {Location} from "@angular/common";

@Injectable()
export class LoginGuardService implements CanActivate {
  constructor(
    public appStateService: AppStateService,
    public router: Router,
    public location: Location,
    ) {}

  canActivate(): boolean {
    if (!this.appStateService.isAuthenticated) {
      this.appStateService.intendedPath = location.pathname;
      this.router.navigateByUrl('/splash');
      return false;
    }
    return true;
  }
}
