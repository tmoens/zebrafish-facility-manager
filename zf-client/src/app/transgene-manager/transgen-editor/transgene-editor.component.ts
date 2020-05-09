import {Component, OnInit} from '@angular/core';
import {classToPlain} from 'class-transformer';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {TransgeneService} from '../transgene.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {DialogService} from '../../dialog.service';
import {TransgeneDto} from "../transgene-dto";

@Component({
  selector: 'app-transgene-editor',
  templateUrl: './transgene-editor.component.html',
  styleUrls: ['./transgene-editor.component.scss']
})
export class TransgeneEditorComponent implements OnInit {
  item: TransgeneDto; // the item we are editing.
  editMode: EditMode;
  id: number;
  saved = false;

  // Build the edit form.
  // Note the ".bind(this)" for name validation - it is because that
  // particular validator needs the context of this object to do its work,
  // but that is not automatically supplied as sync field validators
  // are typically context free.
  mfForm = this.fb.group({
    allele: [''],
    descriptor: ['', [Validators.required]],
    comment: [{value: ''}],
    plasmid: [{value: ''}],
    source: [{value: ''}],
    id: [null],
    serialNumber: [null],
    isDeletable: [true],
    name: [null],
    fullName: [null],
    tooltip: [null],
  }, { validators: this.uniquenessValidator.bind(this) });

  filteredSourceOptions: Observable<string[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public service: TransgeneService,
    private deactivationDialogService: DialogService,
  ) {}


  ngOnInit() {
    // watch for changes to the paramMap (i.e. changes to the route)
    this.route.paramMap.subscribe((pm: ParamMap) => {
      this.service.enterEditMode();
      switch (pm.get('mode')) {
        case EditMode.EDIT:
          this.editMode = EditMode.EDIT;
          this.id = +pm.get('id');
          this.service.getById(this.id).subscribe((item: TransgeneDto) => {
            this.item = item;
            if (this.item.serialNumber) {
              this.mfForm.get('allele').disable();

            } else {
              this.mfForm.get('allele').enable();
            }
            this.initialize();
          });
          break;
        case EditMode.CREATE:
          this.item = new TransgeneDto();
          this.editMode = EditMode.CREATE;
          this.mfForm.get('allele').enable();
          this.initialize();
          break;
        case EditMode.CREATE_NEXT:
          this.item = new TransgeneDto();
          this.item.allele = this.service.likelyNextName;
          this.editMode = EditMode.CREATE_NEXT;
          this.mfForm.get('allele').disable();
          this.initialize();
          break;
        default:
      }

      // Again for the addled brain: this bit just watches what the user has typed in
      // the source field and when it changes, it recalculates the set of remaining values
      // that kinda match what the user has typed.
      this.filteredSourceOptions = this.mfForm.get('source').valueChanges.pipe(
        startWith(''),
        map(value => this.service.fieldOptions.filterOptionsContaining('source', value))
      );
    });
  }

  initialize() {
    this.mfForm.setValue(classToPlain(this.item));
  }

  save() {
    this.saved = true;
    const editedDTO = this.mfForm.getRawValue();
    switch (this.editMode) {
      case EditMode.CREATE:
        this.service.create(editedDTO);
        break;
      case EditMode.CREATE_NEXT:
        this.service.createNext(editedDTO);
        break;
      case EditMode.EDIT:
        this.service.update(editedDTO);
        break;
    }
  }

  cancel() {
    this.router.navigate(['transgene_manager/view']);
  }
  revert() {
    this.initialize();
    this.mfForm.markAsPristine();
  }

  // Tell the user it the descriptor/allele pair they have chosen is already in use.
  // This may be butchery, but it seems to work properly.
  uniquenessValidator(control: FormGroup): ValidationErrors | null {
    const alleleC = control.get('allele');
    const descriptorC = control.get('descriptor');

    // When editing a transgene, don't validate an unchanged allele + descriptor
    // against all allele + descriptors, or it will fail.
    if (this.editMode === EditMode.EDIT) {
      if (this.item.allele === alleleC.value && this.item.descriptor === descriptorC.value) {
        return null;
      }
    }

    // this is duplicating the code used to construct a name for a transgene.
    if (this.service.uniquenessValidator(alleleC.value + ': ' + descriptorC.value)) {
      // The next two lines blithely override any errors on these two fields
      // if there is a uniqueness error.
      alleleC.setErrors({uniqueness: true});
      descriptorC.setErrors({uniqueness: true});
      return {'unique': {value: 'failed'}};
    } else {
      removeErrorFromControl(alleleC, 'uniqueness');
      removeErrorFromControl(descriptorC, 'uniqueness');
      return null;
    }
  }

  getUniquenessError() {
    if (this.mfForm.hasError('unique')) {
      return 'Descriptor + allele must be unique.';
    }
  }

  getFC(name: string): AbstractControl {
    return this.mfForm.get(name);
  }

  clearFormControl(name: string) {
    this.getFC(name).setValue(null);
    this.getFC(name).markAsDirty();
  }

  /* To support deactivation check  */
  /* Contrary to tsLint's perspective, this function *is* invoked by the deactivation guard */
  canDeactivate(): boolean | Observable<boolean> |Promise <boolean> {
    if (this.saved) {
      return true;
    }
    if (this.mfForm.pristine) {
      return true;
    } else {
      return this.deactivationDialogService.confirm('There are unsaved changes to the transgene you are editing.');
    }
  }
}

function removeErrorFromControl(control: AbstractControl, error: string) {
  if (control.hasError(error)) {
    delete control.errors[error];
    control.updateValueAndValidity();
  }
}


