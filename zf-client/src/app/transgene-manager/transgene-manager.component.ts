import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppStateService} from '../app-state.service';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {ZFTool} from "../helpers/zf-tool";

@Component({
  selector: 'app-transgene-manager',
  templateUrl: './transgene-manager.component.html',
  styleUrls: ['./transgene-manager.component.scss']
})
export class TransgeneManagerComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
  ) { }

  ngOnInit() {
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.TRANSGENE_MANAGER));
  }

  create() {
    this.router.navigate([ZFTool.TRANSGENE_MANAGER.route + '/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }

  createNext() {
    this.router.navigate([ZFTool.TRANSGENE_MANAGER.route + '/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }

}
