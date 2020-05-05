import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ZFTool} from "../helpers/zf-tool";
import {AppStateService} from "../app-state.service";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {StockService} from "./stock.service";
import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-stock-manager',
  templateUrl: './stock-manager.component.html',
  styleUrls: ['./stock-manager.component.scss']
})
export class StockManagerComponent implements OnInit {
  // We keep the selector open when the viewport larger than XSmall
  selectorFixed$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(
      map(result => !result.matches),
      shareReplay()
    );


  constructor (
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public authService: AuthService,
    public service: StockService,
    private breakpointObserver: BreakpointObserver,

  ) { }

  ngOnInit() {
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.STOCK_MANAGER));
  }
}
