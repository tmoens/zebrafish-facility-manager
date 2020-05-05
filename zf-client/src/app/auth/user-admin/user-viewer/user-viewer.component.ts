import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {EditMode} from "../../../zf-generic/zf-edit-modes";
import {UserAdminService} from "../user-admin.service";
import {UserDTO} from "../../UserDTO";
import {AppStateService} from "../../../app-state.service";
import {AuthService} from "../../auth.service";

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
    isLoggedIn: [{value: '', disabled: true}],
    name: [{value: '', disabled: true}],
    passwordChangeRequired: [{value: '', disabled: true}],
    phone: [{value: '', disabled: true}],
    role: [{value: '', disabled: true}],
    username: [{value: '', disabled: true}],
  });

  user: UserDTO = null;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public service: UserAdminService,
    private fb: FormBuilder,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.service.selected$.subscribe((u: UserDTO) => {
      if (u) {
        this.user = u;
        this.mfForm.setValue(u);
      }
    });

    // use the route's paramMap to figure out the id of the item we are supposed to view.
    this.route.paramMap.subscribe((pm: ParamMap) => {
      this.service.enterBrowseMode();
      // if there is an id in the route, tell the service to select it.
      const id = pm.get('id');
      if (id) {
        this.service.selectById(id);
      } else {
        // if there is no id in the route, lets see a mutation is already selected and if so, navigate to it.
        if (this.service.selected) {
          this.router.navigateByUrl('user_admin/view/' + this.service.selected.id, {replaceUrl: true});
        }
      }
    });

  }

  edit() {
    this.router.navigate(['user_admin/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

}
