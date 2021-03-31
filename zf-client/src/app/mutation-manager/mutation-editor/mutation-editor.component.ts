import {Component, OnInit} from '@angular/core';
import {MutationDto} from '../mutation-dto';
import {Observable} from 'rxjs';
import {AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators} from '@angular/forms';
import {MutationService} from '../mutation.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {DialogService} from '../../dialog.service';
import {MAT_DATE_FORMATS} from "@angular/material/core";
import {ZF_DATE_FORMATS} from "../../helpers/dateFormats";
import {ScreenSizes} from "../../helpers/screen-sizes";
import {AppStateService} from "../../app-state.service";
import {LoaderService} from '../../loader.service';
import {ZfinMutationDto} from '../../common/zfin/zfin-mutation.dto';
import {ZFTool} from '../../helpers/zf-tool';


@Component({
  selector: 'app-mutation-editor',
  templateUrl: './mutation-editor.component.html',
  styleUrls: ['./mutation-editor.component.scss'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: ZF_DATE_FORMATS},
  ],
})
export class MutationEditorComponent implements OnInit {
  ScreenSizes = ScreenSizes;
  item: MutationDto;
  editMode: EditMode;
  id: number;
  saved = false;

  // There is a zfinMutation AND it differs from our local thoughts on the
  // mutation - offer the user an update from ZFIN
  zfinMutation: ZfinMutationDto;
  canUpdateFromZfin = false;
  zfinGeneNameHint: string;
  zfinIdHint: string;
  zfinScreenTypeHint: string;

  mutationTypeFC: FormControl = new FormControl();

  // Build the edit form.
  // Even though the form does not support editing of every field,
  // all the fields that *can* come in the DTO require a formControl
  // in the group.
  mfForm = this.fb.group({
    alternateGeneName: [''],
    aaChange: [''],
    actgChange: [''],
    comment: [''],
    gene: [''],
    mutationType: [''],
    morphantPhenotype: [''],
    name: ['', [Validators.required, this.nameValidator.bind(this)]],
    nickname: ['', [this.nicknameValidator.bind(this)]],
    phenotype: [''],
    researcher: [''],
    screenType: [''],
    serialNumber: [null],
    spermFreezePlan: [''],
    vialsFrozen: [0],
    zfinId: [null],

    id: [null],
    isDeletable: [true],
    fullName: [null],
  });

// These are arrays containing options for the various filter fields
  filteredGeneOptions: Observable<string[]>;
  filteredResearcherOptions: Observable<string[]>;
  filteredMutationTypeOptions: Observable<string[]>;
  filteredScreenTypeOptions: Observable<string[]>;
  spermFreezeOptions: string[];

  constructor(
    public appState: AppStateService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public service: MutationService,
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
          break;
        case EditMode.CREATE:
          this.editMode = EditMode.CREATE;
          break;
        case EditMode.CREATE_NEXT:
          this.editMode = EditMode.CREATE_NEXT;
          break;
      }
      this.initialize();
    });
  }

  initialize() {
    switch (this.editMode) {
      // in EDIT mode, get a copy of the item to edit.
      case EditMode.EDIT:
        this.service.getById(this.id).subscribe((m: MutationDto) => {
          this.item = m;
          this.mfForm.setValue(this.item);
          this.checkZfin();
        });
        break;

      // In CREATE mode, we make an empty item for the user to edit
      case EditMode.CREATE:
        this.item = new MutationDto();
        // can't change name of mutation unless creating it
        this.mfForm.get('name').enable();
        this.mfForm.setValue(this.item);
        break;

      // In CREATE_NEXT mode we pre-fill the mutation name and disallow user changes
      // Note that the name we pre-fill with is chosen optimistically and the real name
      // may be different if, for example, someone else created a new owned mutation
      // while the user was busy editing this one.
      case EditMode.CREATE_NEXT:
        this.item = new MutationDto();
        this.item.name = this.service.likelyNextName;
        this.mfForm.get('name').disable();
        this.mfForm.setValue(this.item);
        this.checkZfin();
    }
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
    this.router.navigateByUrl(ZFTool.MUTATION_MANAGER.route + '/view').then();
  }

  revert() {
    this.initialize();
    this.mfForm.markAsPristine();
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.item) {
      return null;
    }
    // do not do a "name in use" check against your own name.
    if (this.item.name === control.value) {
      return null;
    }
    if (this.service.nameIsInUse(control.value)) {
      return {'unique': {value: control.value}};
    } else {
      return null;
    }
  }

  nicknameValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.item) {
      return null;
    }
    // do not do a "nickname in use" check against your own nickname.
    if (this.item.nickname === control.value) {
      return null;
    }
    if (this.service.nicknameIsInUse(control.value)) {
      return {'unique': {value: control.value}};
    } else {
      return null;
    }
  }

  get nameControl() {
    return this.mfForm.get('name');
  }

  getNameError() {
    if (this.nameControl.hasError('unique')) {
      return 'The name ' + this.nameControl.value + ' is already in use.';
    }
  }

  get nicknameControl() {
    return this.mfForm.get('nickname');
  }

  getNicknameError() {
    if (this.getControl('nickname').hasError('unique')) {
      return 'The nickname ' + this.nicknameControl.value + ' is already in use.';
    }
  }

  getControl(controlName: string) {
    return this.mfForm.get(controlName);
  }

  getControlValue(controlName: string) {
    return this.getControl(controlName).value;
  }

  setControlValue(controlName: string, value) {
    return this.getControl(controlName).setValue(value);
  }

  /* To support deactivation check  */

  /* Contrary to tsLint's perspective, this function *is* invoked by the deactivation guard */
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.saved) {
      return true;
    }
    if (this.mfForm.pristine) {
      return true;
    } else {
      return this.deactivationDialogService.confirm('There are unsaved changes to the mutation you are editing.');
    }
  }

  // If the allele is "known to ZFIN" and the local fields differ from what ZFIN thinks they
  // should be - let the user know that the differences exist and give them the opportunity
  // to use the ZFIN values as a group.
  // trigger this on initialization and if someone changes the allele
  checkZfin() {
    this.canUpdateFromZfin = false;
    this.zfinGeneNameHint = null;
    this.zfinIdHint = null;
    this.zfinScreenTypeHint = null;
    this.loader.getZfinMutationByName(this.getControlValue('name'))
      .subscribe((zm: ZfinMutationDto) => {
      if (!zm) {
        this.zfinMutation = null;
        return;
      } else {
        this.zfinMutation = zm;
        if (this.getControlValue('gene') !== zm.genes[0].symbol) {
          this.canUpdateFromZfin = true;
          this.zfinGeneNameHint = `ZFIN gene name is ${zm.genes[0].symbol}`
        }
        if (zm.mutagen && this.getControlValue('screenType') !== zm.mutagen) {
          this.canUpdateFromZfin = true;
          this.zfinScreenTypeHint = `ZFIN screen type is ${zm.mutagen}`
        }
        if (this.getControlValue('zfinId') !== zm.featureId) {
          this.canUpdateFromZfin = true;
          this.zfinIdHint = `ZFIN Id is ${zm.featureId}`
        }
      }
    })
  }

  updateFromZfin() {
    this.mfForm.markAsDirty();
    const zm = this.zfinMutation;
    if (zm.genes[0].symbol) {
      this.setControlValue('gene', zm.genes[0].symbol);
    }
    if (zm.mutagen) {
      this.setControlValue('screenType', zm.mutagen);
    }
    this.setControlValue('zfinId', zm.featureId);
    this.checkZfin();
  }
}


