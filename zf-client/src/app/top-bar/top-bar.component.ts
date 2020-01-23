import {Component, OnInit} from '@angular/core';
import {AppStateService, ZFTool} from '../app-state.service';
import {Router} from '@angular/router';
import {AuthService} from "../auth/auth.service";
import {ConfigService} from "../config/config.service";

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  zfTool = ZFTool;
  constructor(
    public configService: ConfigService,
    public appState: AppStateService,
    private router: Router,
    public authService: AuthService,
  ) {
  }

  async ngOnInit() {
  }
}
