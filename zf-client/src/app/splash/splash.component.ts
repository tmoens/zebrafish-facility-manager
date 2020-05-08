import { Component, OnInit } from '@angular/core';
import {LoaderService} from "../loader.service";
import {AppStateService} from "../app-state.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-splash',
  template:`
    <div class="big-background"></div>
  `,
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  username: string = null;
  password: string = null;

  constructor(
    private appStateService: AppStateService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
  }

}
