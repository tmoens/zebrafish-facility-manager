import {Component, OnInit} from '@angular/core';
import {EditMode} from '../../../zf-generic/zf-edit-modes';
import {UserDTO} from '../../UserDTO';
import {AbstractControl, AsyncValidatorFn, FormBuilder, ValidationErrors, Validators} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {DialogService} from '../../../dialog.service';
import {UserAdminService} from '../user-admin.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {AppRoles} from '../../app-roles';
import {AuthService} from '../../auth.service';
import {AppStateService} from '../../../app-state.service';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})

export class UserEditorComponent implements OnInit {
  roles: string[] = AppRoles.getRoles(); // so it is available to the gui
  user: UserDTO; // the item we are editing.
  editMode: EditMode;
  id: string;
  saved = false;

  // A note on the email and username async validators
  // these need to call the api service to do their checks, but not if the email/username
  // is the same as it was when we started editing the user.  For this the validator needs
  // to be able to see both the api service and the "original" user.  I can pass the api
  // service to the validator function easily enough but I cannot pass the current user dto.
  // SO, out comes the sledge hammer and I pass the whole of "this" to the validators, which
  // now have everything they need.
  mfForm = this.fb.group({
    email: ['', [Validators.required, Validators.email], [existingEmailValidatorFn(this)]],
    id: [null],
    isActive: [{value: true, disabled: true}],
    isLoggedIn: [{value: false, disabled: true}],
    name: [null, [Validators.required], [existingNameValidatorFn(this)]],
    passwordChangeRequired: [{value: false, disabled: true}],
    phone: [null],
    role: ['guest', [Validators.required]],
    username: [null, [Validators.required], [existingUsernameValidatorFn(this)]],
    isPrimaryInvestigator: [false],
    isResearcher: [false],
    initials: [null, [Validators.required], [existingInitialsValidatorFn(this)]],
    isDeletable: [{value: '', disabled: true}],
  } );

  constructor(
    public appState: AppStateService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public service: UserAdminService,
    private deactivationDialogService: DialogService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // watch for changes to the paramMap (i.e. changes to the route)
    this.route.paramMap.subscribe((pm: ParamMap) => {
      switch (pm.get('mode')) {
        case EditMode.EDIT:
          this.editMode = EditMode.EDIT;
          this.id = pm.get('id');
          this.service.getById(this.id).subscribe((item: UserDTO) => {
            this.user = item;
            this.initialize();
          });
          break;
        case EditMode.CREATE:
          this.user = new UserDTO();
          this.user.isActive = true;
          this.user.isLoggedIn = false;
          this.user.passwordChangeRequired = true;
          this.editMode = EditMode.CREATE;
          this.initialize();
          break;
        default:
      }
    });
  }

  initialize() {
    this.mfForm.setValue(this.user);
    // We do not want the admin user to degrade their own role in case there is
    // no one left to administer the site.
    if (this.user.id === this.authService.loggedInUserId()) {
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

  getErrorMessage(fcName:string): string {
    const eFC = this.getFC(fcName);
    if (eFC.hasError('required')) {
      return 'field is required';
    }
    if (eFC.hasError('email')) {
      return 'Invalid email';
    }
    if (eFC.hasError('inUse')) {
      return 'already in use';
    }
  }
}

function existingEmailValidatorFn(t: UserEditorComponent): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    // don't bother with the going to the server if the email belongs to the user being edited.
    if (t.user && t.user.email && t.user.email === control.value) { return of(null); }
    return t.service.isEmailInUse(control.value).pipe(
      map((result: boolean) => {
        return result ? {inUse: true} : null;
      })
    );
  };
}

function existingUsernameValidatorFn(t: UserEditorComponent): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    // don't bother with the going to the server if the username belongs to the user being edited.
    if (t.user && t.user.username && t.user.username === control.value) { return of(null); }
    return t.service.isUsernameInUse(control.value).pipe(
      map((result: boolean) => {
        return result ? {inUse: true} : null;
      })
    );
  };
}

function existingNameValidatorFn(t: UserEditorComponent): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    // don't bother with the going to the server if the name belongs to the user being edited.
    if (t.user && t.user.name && t.user.name === control.value) { return of(null); }
    return t.service.isNameInUse(control.value).pipe(
      map((result: boolean) => {
        return result ? {inUse: true} : null;
      })
    );
  };
}

function existingInitialsValidatorFn(t: UserEditorComponent): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    // don't bother with the going to the server if the initials belong to the user being edited.
    if (t.user && t.user.initials && t.user.initials === control.value) { return of(null); }
    return t.service.isInitialsInUse(control.value).pipe(
      map((result: boolean) => {
        return result ? {inUse: true} : null;
      })
    );
  };
}
