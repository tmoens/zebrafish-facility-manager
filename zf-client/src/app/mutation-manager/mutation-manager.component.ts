import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppStateService, ZFTool} from '../app-state.service';

@Component({
  selector: 'app-mutation-manager',
  templateUrl: './mutation-manager.component.html',
  styleUrls: ['./mutation-manager.component.scss']
})
export class MutationManagerComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
  ) { }

  ngOnInit() {
    this.route.url.subscribe( () => this.appState.setActiveTool(ZFTool.MUTATION_MANAGER));
  }
}