import {Component, OnInit} from '@angular/core';
import {EditMode} from "../../zf-generic/zf-edit-modes";
import {UserDTO} from "../../common/user/UserDTO";
import {AbstractControl, AsyncValidatorFn, FormBuilder, ValidationErrors, Validators} from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {DialogService} from "../../dialog.service";
import {UserAdminService} from "../user-admin.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ZFRoles} from "../../common/auth/zf-roles";
import {AppStateService} from "../../app-state.service";

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
    email: ['', [Validators.required, Validators.email], [existingEmailValidatorFn(this.service)]],
    id: [null],
    isActive: [{value: true, disabled: true}],
    isLoggedIn: [{value: false, disabled: true}],
    name: [null],
    passwordChangeRequired: [{value: false, disabled: true}],
    phone: [null],
    role: ['guest', [Validators.required]],
    username: [null, [Validators.required], [existingUsernameValidatorFn(this.service)]],
  } );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public service: UserAdminService,
    private deactivationDialogService: DialogService,
    private appState: AppStateService,
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
          this.item.isActive = true;
          this.item.isLoggedIn = false;
          this.item.passwordChangeRequired = true;
          this.editMode = EditMode.CREATE;
          this.initialize();
          break;
        default:
      }
    });
  }

  initialize() {
    this.mfForm.setValue(this.item);
    // We do not want the admin user to degrade their own role in case there is
    // no one left to administer the site.
    if (this.item.id === this.appState.loggedInUserId()) {
      this.getFC('role').disable();
    }
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

  emailErrorMessage(): string {
    const eFC = this.getFC('email');
    if (eFC.hasError('required')) {
      return 'email is required';
    }
    if (eFC.hasError('email')) {
      return 'Invalid email';
    }
    if (eFC.hasError('inUse')) {
      return 'Another user is using that e-mail';
    }
  }

  usernameErrorMessage(): string {
    const eFC = this.getFC('username');
    if (eFC.hasError('required')) {
      return 'email is required';
    }
    if (eFC.hasError('inUse')) {
      return 'That username is taken';
    }
  }
}

function existingEmailValidatorFn(service: UserAdminService): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return service.isEmailInUse(control.value).pipe(
      map((result: boolean) => {
        return result ? {inUse: true} : null;
      })
    )
  };
}

function existingUsernameValidatorFn(service: UserAdminService): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    return service.isUsernameInUse(control.value).pipe(
      map((result: boolean) => {
        return result ? {inUse: true} : null;
      })
    )
  };
}
