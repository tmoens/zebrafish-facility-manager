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
    this.route.paramMap.subscribe((pm: ParamMap) => {
      // if there is an id in the route, tell the service to select it.
      const id = +pm.get('id');
      if (id) {
        this.service.selectByIdAndLoad(id);
      } else {
        // if there is no id in the route, lets see a mutation is already selected and if so, navigate to it.
        if (this.service.selected) {
          this.router.navigateByUrl('mutation_manager/view/' + this.service.selected.id, {replaceUrl: true});
        } else {
          // we were not given an id to view and there is no "selected" id, final try is to
          // navigate to the first iem in the list...
          const firstId = this.service.getFirstFiltered();
          if (firstId) {
            this.router.navigateByUrl('mutation_manager/view/' + firstId, {replaceUrl: true});
          }
        }
      }
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
