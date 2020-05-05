import {Injectable} from "@angular/core";
import {CanActivate, Router} from "@angular/router";
import {Location} from "@angular/common";
import {AuthService} from "../auth.service";

@Injectable()
export class LoginGuardService implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
    ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated) {
      this.authService.intendedPath = location.pathname;
      this.router.navigateByUrl('/login');
      return false;
    }
    return true;
  }
}
