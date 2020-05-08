import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ZFTool} from "../helpers/zf-tool";
import {AppStateService} from "../app-state.service";
import {MutationService} from "./mutation.service";
import {Breakpoints, BreakpointObserver} from "@angular/cdk/layout";
import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-mutation-manager',
  templateUrl: './mutation-manager.component.html',
  styleUrls: ['./mutation-manager.component.scss']
})
export class MutationManagerComponent implements OnInit {

  // This tracks if we want the selector open (fixed) or toggleable.
  selectorFixed: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public authService: AuthService,
    public service: MutationService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit() {

    // We keep the selector open when the viewport larger than XSmall
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.selectorFixed = !(result.matches)
      );

    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.MUTATION_MANAGER));

  }
}
