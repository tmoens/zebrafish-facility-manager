import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {EditMode} from "../../zf-generic/zf-edit-modes";
import {UserAdminService} from "../user-admin.service";
import {UserDTO} from "../../common/user/UserDTO";

@Component({
  selector: 'app-user-viewer',
  templateUrl: './user-viewer.component.html',
  styleUrls: ['./user-viewer.component.scss']
})
export class UserViewerComponent implements OnInit {
  // Build the filter form.
  mfForm = this.fb.group({
    email: [{value: '', disabled: true}],
    id: [{value: '', disabled: true}],
    isActive: [{value: '', disabled: true}],
    name: [{value: '', disabled: true}],
    phone: [{value: '', disabled: true}],
    role: [{value: '', disabled: true}],
    username: [{value: '', disabled: true}],
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public service: UserAdminService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.service.selected$.subscribe((u: UserDTO) => {
      if (u) {
        this.mfForm.setValue(u);
      }
    });


    this.route.paramMap.subscribe((pm: ParamMap) => {
      const id = pm.get('id');
      if (id) {
        this.service.selectById(id);
      }
    });

  }

  create() {
    this.router.navigate(['user_admin/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }

  edit() {
    this.router.navigate(['user_admin/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }
}
