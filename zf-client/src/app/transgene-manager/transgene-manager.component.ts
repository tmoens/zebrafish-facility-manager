import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppStateService} from '../app-state.service';
import {ZFTool} from "../helpers/zf-tool";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {TransgeneService} from "./transgene.service";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-transgene-manager',
  templateUrl: './transgene-manager.component.html',
  styleUrls: ['./transgene-manager.component.scss']
})
export class TransgeneManagerComponent implements OnInit {

  // This tracks if we want the selector open (fixed) or toggleable.
  selectorFixed: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public authService: AuthService,
    public service: TransgeneService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit() {
    // We keep the selector open when the viewport larger than XSmall
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.selectorFixed = !(result.matches)
      );
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.TRANSGENE_MANAGER));
  }
}
