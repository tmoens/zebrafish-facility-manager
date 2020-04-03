import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {EditMode} from "../../zf-generic/zf-edit-modes";
import {AppStateService} from "../../app-state.service";
import {ZFRoles} from "../../common/auth/zf-roles";

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
  zfRoles = ZFRoles;

  constructor(
    private router: Router,
    private appStateService: AppStateService,
  ) { }

  ngOnInit(): void {
  }

  create() {
    this.router.navigate(['user_admin/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }
}
