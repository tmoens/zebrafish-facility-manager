import { Component, OnInit } from '@angular/core';
import {LoaderService} from "../loader.service";
import {AppStateService} from "../app-state.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  username: string = null;
  password: string = null;

  constructor(
    private loaderService: LoaderService,
    private appStateService: AppStateService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    console.log({username: this.username, password: this.password});
    this.loaderService.login(this.username, this.password).subscribe( (token: any) => {
      if (token) {
        this.appStateService.onLogin(token.access_token);
        this.router.navigateByUrl(this.appStateService.getDefaultURI());
      } else {
        this.appStateService.onLoginFailed();
      }
    });
  }

}
