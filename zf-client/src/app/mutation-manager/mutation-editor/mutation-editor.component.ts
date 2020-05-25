import {Component, OnInit} from '@angular/core';
import {MutationDto} from '../mutation-dto';
import {Observable} from 'rxjs';
import {AbstractControl, FormBuilder, ValidationErrors, Validators} from '@angular/forms';
import {MutationService} from '../mutation.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {map, startWith} from 'rxjs/operators';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {DialogService} from '../../dialog.service';
import {MAT_DATE_FORMATS} from "@angular/material/core";
import {ZF_DATE_FORMATS} from "../../helpers/dateFormats";


@Component({
  selector: 'app-mutation-editor',
  templateUrl: './mutation-editor.component.html',
  styleUrls: ['./mutation-editor.component.scss'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: ZF_DATE_FORMATS},
  ],
})
export class MutationEditorComponent implements OnInit {
  item: MutationDto;
  editMode: EditMode;
  id: number;
  saved = false;
  curious = 0;

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
    researcher: ['', Validators.required],
    screenType: [''],
    serialNumber: [null],
    spermFreezePlan: [''],
    thawDate: [null],
    tillingMaleNumber: [null],
    vialsFrozen: [0],

    id: [null],
    isDeletable: [true],
    fullName: [null],
    tooltip: [null],
  });

// These are arrays containing options for the various filter fields
  filteredGeneOptions: Observable<string[]>;
  filteredResearcherOptions: Observable<string[]>;
  filteredMutationTypeOptions: Observable<string[]>;
  filteredScreenTypeOptions: Observable<string[]>;
  spermFreezeOptions: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: MutationService,
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

    this.spermFreezeOptions = this.service.spermFreezeOptions;

    // Again for the addled brain: this bit just watches what the user has typed in
    // the gene field and when it changes, it recalculates the set of remaining values
    // that kinda match what the user has typed.
    this.filteredResearcherOptions = this.mfForm.get('researcher').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('researcher', value))
    );

    this.filteredGeneOptions = this.mfForm.get('gene').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('gene', value))
    );

    this.filteredScreenTypeOptions = this.mfForm.get('screenType').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('screenType', value))
    );

    this.filteredMutationTypeOptions = this.mfForm.get('mutationType').valueChanges.pipe(
      startWith(''),
      map(value => this.service.fieldOptions.filterOptionsContaining('mutationType', value))
    );
  }

  // watch for changes in the route parameters.  That is, a new navigation to the mutation editor
  initialize() {
    switch (this.editMode) {
      // in EDIT mode, get a copy of the item to edit.
      case EditMode.EDIT:
        this.service.getById(this.id).subscribe((m: MutationDto) => {
          this.item = m;
          // TODO This seems wrong. Why can I not change the name of un-owned mutations?
          this.mfForm.get('name').disable();
          this.mfForm.setValue(this.item);
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
      // Note that the name we prefill with is chosen optimistically and the real name
      // may be different if, for example, someone else created a new owned mutation
      // while the user was busy editing this one.
      case EditMode.CREATE_NEXT:
        this.item = new MutationDto();
        this.item.name = this.service.likelyNextName;
        this.mfForm.get('name').disable();
        this.mfForm.setValue(this.item);
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
    this.router.navigateByUrl('mutation_manager/view');
  }

  revert() {
    this.initialize();
    this.mfForm.markAsPristine();
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
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
    if (this.service.nicknameIsInUse(control.value, this.item.id)) {
      return {'unique': {value: control.value}};
    } else {
      return null;
    }
  }

  get nameControl() {
    console.log('name: ' + this.curious++);
    return this.mfForm.get('name');
  }

  get nicknameControl() {
    console.log('nickname: ' + this.curious++);
    return this.mfForm.get('nickname');
  }

  getNameError() {
    if (this.nameControl.hasError('unique')) {
      return 'The name ' + this.nameControl.value + ' is already in use.';
    }
  }

  getNicknameError() {
    if (this.nicknameControl.hasError('unique')) {
      return 'The nickname ' + this.nicknameControl.value + ' is already in use.';
    }
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
      return this.deactivationDialogService.confirm('There are unsaved changes to the mutation you are editing.');
    }
  }
}


