import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ZFTool} from "../helpers/zf-tool";
import {AppStateService} from "../app-state.service";
import {MutationService} from "./mutation.service";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-mutation-manager',
  templateUrl: './mutation-manager.component.html',
  styleUrls: ['./mutation-manager.component.scss']
})
export class MutationManagerComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public authService: AuthService,
    public service: MutationService,
  ) {
    this.appState.setActiveTool(ZFTool.MUTATION_MANAGER);
  }
}
