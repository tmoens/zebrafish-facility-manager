import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AppStateService} from "../../app-state.service";
import {ZFTool} from "../../helpers/zf-tool";
import {UserAdminService} from "./user-admin.service";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss'],
})
export class UserAdminComponent implements OnInit {

  // We keep the selector open when the viewport larger than XSmall
  selectorFixed$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.XSmall])
    .pipe(
      map(result => !result.matches),
      shareReplay()
    );

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public authService: AuthService,
    public service: UserAdminService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit() {
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.USER_MANAGER));
  }
}
