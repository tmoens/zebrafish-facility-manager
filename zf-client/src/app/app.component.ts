import {Component, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {AppStateService} from "./app-state.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'zf-client';

  constructor(
    private appState: AppStateService,
    private breakpointObserver: BreakpointObserver,
  ) {
  }


  ngOnInit(): void {
    // We keep the selector open when the viewport larger than XSmall
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => this.appState.selectorFixed = !(result.matches)
      );
  }
}
