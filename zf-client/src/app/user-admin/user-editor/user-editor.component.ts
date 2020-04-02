import { Component, OnInit } from '@angular/core';
import {EditMode} from "../../zf-generic/zf-edit-modes";
import {UserDTO} from "../../common/user/UserDTO";
import {AbstractControl, FormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {DialogService} from "../../dialog.service";
import {UserAdminService} from "../user-admin.service";
import {Observable} from "rxjs";
import {ZFRoles} from "../../common/auth/zf-roles";

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})

export class UserEditorComponent implements OnInit {
  roles: string[] = ZFRoles.getRoles(); // so it is available to the gui
  item: UserDTO; // the item we are editing.
  editMode: EditMode;
  id: string;
  saved = false;

  // Build the edit form.
  // Note the ".bind(this)" for name validation - it is because that
  // particular validator needs the context of this object to do its work,
  // but that is not automatically supplied as sync field validators
  // are typically context free.
  mfForm = this.fb.group({
    email: ['', [Validators.required]],
    id: [null],
    isActive: [true],
    name: [null],
    passwordChangeRequired: [true],
    phone: [null],
    role: ['guest', [Validators.required]],
    username: [null, [Validators.required]],
  } );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public service: UserAdminService,
    private deactivationDialogService: DialogService,
  ) {}

  ngOnInit(): void {
    // watch for changes to the paramMap (i.e. changes to the route)
    this.route.paramMap.subscribe((pm: ParamMap) => {
      switch (pm.get('mode')) {
        case EditMode.EDIT:
          this.editMode = EditMode.EDIT;
          this.id = pm.get('id');
          this.service.getById(this.id).subscribe((item: UserDTO) => {
            this.item = item;
            this.initialize();
          });
          break;
        case EditMode.CREATE:
          this.item = new UserDTO();
          this.editMode = EditMode.CREATE;
          this.initialize();
          break;
        default:
      }
    });
  }

  initialize() {
    this.mfForm.setValue(this.item);
  };

  save() {
    this.saved = true;
    const editedDTO: UserDTO = (this.mfForm.getRawValue());
    switch (this.editMode) {
      case EditMode.CREATE:
        this.service.create(editedDTO);
        break;
      case EditMode.EDIT:
        this.service.update(editedDTO);
        break;
    }
    this.router.navigate(['user_admin/view']);
  }

  cancel() {
    this.router.navigate(['user_admin/view']);
  }

  revert() {
    this.initialize();
  }

  /* To support deactivation check  */
  canDeactivate(): boolean | Observable<boolean> |Promise <boolean> {
    if (this.saved) {
      return true;
    }
    if (this.mfForm.pristine) {
      return true;
    } else {
      return this.deactivationDialogService.confirm('There are unsaved changes to the user you are editing.');
    }
  }

  getFC(name: string): AbstractControl {
    return this.mfForm.get(name);
  }

  clearFormControl(name: string) {
    this.getFC(name).setValue(null);
  }

}
