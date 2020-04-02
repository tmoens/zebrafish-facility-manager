import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AppStateService} from "../app-state.service";
import {ZFTool} from "../helpers/zf-tool";

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss'],
})
export class UserAdminComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
  ) { }

  ngOnInit() {
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.USER_MANAGER));
  }
}
