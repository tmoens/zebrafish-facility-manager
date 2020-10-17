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
    // We keep the selector open when the viewport larger than XSmall
    // this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
    //   .subscribe(result => {
    //       console.log("Breakpoint Observer result: " + JSON.stringify(result));
    //       console.log("Breakpoint Observer result matches: " + JSON.stringify(result.matches));
    //       this.appState.selectorFixed = !(result.matches);
    //     }
    //   );
    const small = '(max-width: 719.99px)';
    const medium = '(min-width: 720px) and (max-width: 959.99px)';
    const large = '(min-width: 960px)';

    this.breakpointObserver.observe([small, medium, large])
      .subscribe(result => {
          console.log("Breakpoint Observer result: " + JSON.stringify(result));
          if (result.breakpoints[small]) {
            console.log("SMALL");
            this.appState.screenSize = ScreenSizes.SMALL
            this.appState.selectorFixed = false;
          }
          if (result.breakpoints[medium]) {
            console.log("MEDIUM");
            this.appState.screenSize = ScreenSizes.MEDIUM
            this.appState.selectorFixed = true;
          }
          if (result.breakpoints[large]) {
            console.log("LARGE");
            this.appState.screenSize = ScreenSizes.LARGE
            this.appState.selectorFixed = true;
          }
        }
      );
  }
}
