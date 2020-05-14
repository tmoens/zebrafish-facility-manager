import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ZFTool} from "../helpers/zf-tool";
import {AppStateService} from "../app-state.service";
import {StockService} from "./stock.service";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-stock-manager',
  templateUrl: './stock-manager.component.html',
  styleUrls: ['./stock-manager.component.scss']
})
export class StockManagerComponent implements OnInit {

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public authService: AuthService,
    public service: StockService,
  ) { }

  ngOnInit() {
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.STOCK_MANAGER));
  }
}
