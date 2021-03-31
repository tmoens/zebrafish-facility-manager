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
import {LoaderService} from '../../loader.service';
import {ZfinTransgeneDto} from '../../common/zfin/zfin-transgene.dto';
import {ZFTool} from '../../helpers/zf-tool';

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

  // There is a zfinTransgene AND it differs from our local thoughts on the
  // transgene - offer the user an update from ZFIN
  zfinTg: ZfinTransgeneDto;
  canUpdateFromZfin = false;
  zfinAlleleHint: string;
  zfinConstructNameHint: string;
  zfinIdHint: string;
  zfinScreenTypeHint: string;

  // Build the edit form.
  mfForm = this.fb.group({
    allele: [''],
    descriptor: ['', [Validators.required]],
    comment: [{value: ''}],
    name: [null],
    nickname: ['', [this.nicknameValidator.bind(this)]],
    plasmid: [{value: ''}],
    serialNumber: [null],
    source: [{value: ''}],
    spermFreezePlan: [''],
    vialsFrozen: [0],
    zfinId: [null],

    id: [null],
    isDeletable: [true],
    fullName: [null],
  }, { validators: this.uniquenessValidator.bind(this) });

  filteredSourceOptions: Observable<string[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public service: TransgeneService,
    public loader: LoaderService,
    private deactivationDialogService: DialogService,
  ) {
    this.service.enterEditMode();
  }


  ngOnInit() {
    // watch for changes to the paramMap (i.e. changes to the route)
    this.route.paramMap.subscribe((pm: ParamMap) => {
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
            this.checkZfin();
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
          this.checkZfin();
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
    this.router.navigate([ZFTool.TRANSGENE_MANAGER.route + '/view']).then();
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
      return 'Feature name plus construct must be unique.';
    }
  }

  nicknameValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.item) {
      return null;
    }
    if (this.service.nicknameIsInUse(control.value, this.item.id)) {
      return {'unique': {value: control.value}};
    } else {
      return null;
    }
  }

  get nicknameControl() {
    return this.mfForm.get('nickname');
  }

  getNicknameError() {
    if (this.nicknameControl.hasError('unique')) {
      return 'The nickname ' + this.nicknameControl.value + ' is already in use.';
    }
  }

  clearFormControl(name: string) {
    this.getControl(name).setValue(null);
    this.getControl(name).markAsDirty();
  }

  getControl(name: string): AbstractControl {
    return this.mfForm.get(name);
  }

  getControlValue(controlName: string) {
    return this.getControl(controlName).value;
  }

  setControlValue(controlName: string, value) {
    return this.getControl(controlName).setValue(value);
  }


  /* To support deactivation check  */
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


  // If the transgene allele is "known to ZFIN" and the local fields differ from what ZFIN thinks they
  // should be - let the user know that the differences exist and give them the opportunity
  // to use the ZFIN values as a group.
  // trigger this on initialization and if someone changes the allele
  checkZfin() {
    this.canUpdateFromZfin = false;
    this.zfinAlleleHint = null;
    this.zfinConstructNameHint = null;
    this.zfinIdHint = null;
    this.loader.getZfinTransgeneByName(this.getControlValue('allele'))
      .subscribe((zt: ZfinTransgeneDto) => {
      if (!zt) {
        this.zfinTg = null;
        return;
      } else {
        this.zfinTg = zt;
        if (this.getControlValue('allele') !== zt.symbol) {
          this.canUpdateFromZfin = true;
          this.zfinAlleleHint = `ZFIN name is ${zt.symbol}`
        }
        if (this.getControlValue('descriptor') !== zt.constructs[0].symbol) {
          this.canUpdateFromZfin = true;
          this.zfinConstructNameHint = `ZFIN construct name is ${zt.constructs[0].symbol}`
        }
        if (this.getControlValue('zfinId') !== zt.featureId) {
          this.canUpdateFromZfin = true;
          this.zfinIdHint = `ZFIN Id is ${zt.featureId}`
        }
      }
    })
  }

  updateFromZfin() {
    const zt = this.zfinTg;
    this.mfForm.markAsDirty();
    this.setControlValue('allele', zt.symbol);
    if (zt.constructs[0].symbol !== this.getControlValue('descriptor')) {
      if (! this.getControlValue('nickname')) {
        this.setControlValue('nickname', this.getControlValue('descriptor'));
      }
      this.setControlValue('descriptor', zt.constructs[0].symbol);
    }
    this.setControlValue('zfinId', zt.featureId);
    this.checkZfin();
  }

}

function removeErrorFromControl(control: AbstractControl, error: string) {
  if (control.hasError(error)) {
    delete control.errors[error];
    control.updateValueAndValidity();
  }
}


