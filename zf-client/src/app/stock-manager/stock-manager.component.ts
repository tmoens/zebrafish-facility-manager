import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ZFTool} from "../helpers/zf-tool";
import {AppStateService} from "../app-state.service";

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
  ) { }

  ngOnInit() {
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.STOCK_MANAGER));
  }

}
