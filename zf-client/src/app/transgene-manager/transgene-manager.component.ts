import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppStateService} from '../app-state.service';
import {ZFTool} from "../helpers/zf-tool";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {TransgeneService} from "./transgene.service";

@Component({
  selector: 'app-transgene-manager',
  templateUrl: './transgene-manager.component.html',
  styleUrls: ['./transgene-manager.component.scss']
})
export class TransgeneManagerComponent implements OnInit {
  // We keep the selector open when the viewport larger than Small
  selectorFixed$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(
      map(result => !result.matches),
      shareReplay()
    );

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public service: TransgeneService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit() {
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.TRANSGENE_MANAGER));
  }
}
