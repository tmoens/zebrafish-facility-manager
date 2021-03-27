import {Component, OnInit} from '@angular/core';
import {BreakpointObserver} from "@angular/cdk/layout";
import {AppStateService} from "./app-state.service";
import {ScreenSizes} from "./helpers/screen-sizes";

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
    const small = '(max-width: 719.99px)';
    const medium = '(min-width: 720px) and (max-width: 959.99px)';
    const large = '(min-width: 960px)';

    this.breakpointObserver.observe([small, medium, large])
      .subscribe(result => {
          if (result.breakpoints[small]) {
            this.appState.screenSize = ScreenSizes.SMALL
            this.appState.selectorFixed = false;
          }
          if (result.breakpoints[medium]) {
            this.appState.screenSize = ScreenSizes.MEDIUM
            this.appState.selectorFixed = true;
          }
          if (result.breakpoints[large]) {
            this.appState.screenSize = ScreenSizes.LARGE
            this.appState.selectorFixed = true;
          }
        }
      );
  }

  getStyle(): string {
    return "backgroundColor: " + this.appState.facilityConfig.backgroundColor;
  }
}
