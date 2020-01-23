import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MutationService} from '../mutation.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {classToPlain} from 'class-transformer';
import {Mutation} from '../mutation';
import {EditMode} from '../../zf-generic/zf-edit-modes';

/**
 * Show the details of the "selected" mutation.
 */

/**
 * Design note - the service is where the data model for the various
 * components of the Mutation Manager GUI live.  So, the MutationViewer
 * component has very little in the way of it's own data.  It is just a
 * GUI component with the single purpose.
 */


@Component({
  selector: 'app-mutation-viewer',
  templateUrl: './mutation-viewer.component.html',
  styleUrls: ['./mutation-viewer.component.scss']
})
export class MutationViewerComponent implements OnInit {
  // Build the filter form.
  mfForm = this.fb.group({
    aaChange: [{value: '', disabled: true}],
    actgChange: [{value: '', disabled: true}],
    alternateGeneName: [{value: '', disabled: true}],
    comment: [{value: '', disabled: true}],
    gene: [{value: '', disabled: true}],
    id: [null],
    morphantPhenotype: [{value: '', disabled: true}],
    mutationType: [{value: '', disabled: true}],
    name: [{value: '', disabled: true}],
    phenotype: [{value: '', disabled: true}],
    researcher: [{value: '', disabled: true}],
    screenType: [{value: '', disabled: true}],
    serialNumber: [{value: null, disabled: true}],
    spermFreezePlan: [{value: '', disabled: true}],
    thawDate: [{value: null, disabled: true}],
    tillingMaleNumber: [{value: null, disabled: true}],
    vialsFrozen: [{value: '', disabled: true}],
    isDeletable: [{value: '', disabled: true}],
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public service: MutationService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.service.selected$.subscribe((selected: Mutation) => {
      if (selected) {
        this.mfForm.setValue(classToPlain(selected));
      }
    });

    // use the route's paramMap to figure out the id of the item we are supposed to view.
    // Select it.
    // Then let nature take it's course.  We will notice when it becomes selected and
    // then we populate the form with the data from the selected item.
    this.route.paramMap.subscribe((pm: ParamMap) => {
      const id = +pm.get('id');
      if (id) { this.service.selectById(id); }
    });
  }

  create() {
    this.router.navigate(['mutation_manager/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }

  createNext() {
    this.router.navigate(['mutation_manager/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }

  edit() {
    this.router.navigate(['mutation_manager/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

  delete() {
    this.service.delete(this.service.selected.id);
    const foo = 0;
  }
}
