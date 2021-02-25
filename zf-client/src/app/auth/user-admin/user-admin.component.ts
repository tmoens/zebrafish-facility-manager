import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppStateService} from '../../app-state.service';
import {ZFTool} from '../../helpers/zf-tool';
import {UserAdminService} from './user-admin.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss'],
})
export class UserAdminComponent implements OnInit {
  // This tracks if we want the selector open (fixed) or toggleable.
  selectorFixed: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public authService: AuthService,
    public service: UserAdminService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit() {
    // We keep the selector open when the viewport larger than XSmall
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.selectorFixed = !(result.matches)
      );

    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.USER_MANAGER));
  }
}
