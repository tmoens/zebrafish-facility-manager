import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {EditMode} from '../../../zf-generic/zf-edit-modes';
import {AppRoles} from '../../app-roles';
import {UserAdminService} from '../user-admin.service';
import {UserDTO} from '../../UserDTO';
import {AuthService} from '../../auth.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
  zfRoles = AppRoles;
  user: UserDTO;

  constructor(
    private router: Router,
    public service: UserAdminService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.service.selected$.subscribe((u: UserDTO) => {
      this.user = u;
    });
  }

  create() {
    this.router.navigate(['user_admin/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }

  delete(id: string) {
    this.service.delete(id)
  }

  edit() {
    this.router.navigate(['user_admin/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

}
