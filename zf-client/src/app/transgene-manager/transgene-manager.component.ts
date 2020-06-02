import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppStateService} from '../app-state.service';
import {ZFTool} from "../helpers/zf-tool";
import {TransgeneService} from "./transgene.service";
import {AuthService} from "../auth/auth.service";

@Component({
  selector: 'app-transgene-manager',
  templateUrl: './transgene-manager.component.html',
  styleUrls: ['./transgene-manager.component.scss']
})
export class TransgeneManagerComponent {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public appState: AppStateService,
    public authService: AuthService,
    public service: TransgeneService,
  ) {
    this.appState.setActiveTool(ZFTool.TRANSGENE_MANAGER);
  }
}
