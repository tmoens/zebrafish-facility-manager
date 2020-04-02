import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {EditMode} from "../../zf-generic/zf-edit-modes";

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  create() {
    this.router.navigate(['user_admin/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }
}
