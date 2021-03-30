import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {MutationService} from '../mutation.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {MutationDto} from "../mutation-dto";
import {AppStateService, ZFToolStates} from "../../app-state.service";
import {ScreenSizes} from "../../helpers/screen-sizes";
import {ZFTypes} from "../../helpers/zf-types";

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
  ScreenSizes = ScreenSizes;

  // Build the filter form.
  mfForm = this.fb.group({
    aaChange: [{value: '', disabled: true}],
    actgChange: [{value: '', disabled: true}],
    alternateGeneName: [{value: '', disabled: true}],
    comment: [{value: '', disabled: true}],
    gene: [{value: '', disabled: true}],
    morphantPhenotype: [{value: '', disabled: true}],
    mutationType: [{value: '', disabled: true}],
    name: [{value: '', disabled: true}],
    nickname: [{value: '', disabled: true}],
    phenotype: [{value: '', disabled: true}],
    researcher: [{value: '', disabled: true}],
    screenType: [{value: '', disabled: true}],
    serialNumber: [{value: null, disabled: true}],
    spermFreezePlan: [{value: '', disabled: true}],
    vialsFrozen: [{value: '', disabled: true}],
    zfinId: [{value: '', disabled: true}],

    id: [null],
    isDeletable: [true],
    fullName: [null],
  });

  constructor(
    public appState: AppStateService,
    private router: Router,
    private route: ActivatedRoute,
    public service: MutationService,
    private fb: FormBuilder,
  ) {
    this.service.enterBrowseMode();
  }

  ngOnInit() {
    this.service.selected$.subscribe((selected: MutationDto) => {
      if (selected) {
        this.mfForm.setValue(selected);
      }
    });

    // use the route's paramMap to figure out the id of the item we are supposed to view.
    this.route.paramMap.subscribe((pm: ParamMap) => {
      // if there is an id in the route, tell the service to select it.
      const id = +pm.get('id');
      if (id) {
        this.service.selectByIdAndLoad(id);
      } else {
        // if there is no id in the route, see if a stock is already in the app-state
        // (e.g. on restart) and if so, navigate to it.
        const storedId = this.appState.getToolState(ZFTypes.MUTATION, ZFToolStates.SELECTED_ID);
        if (storedId) {
          this.router.navigateByUrl('mutation_manager/view/' + storedId, {replaceUrl: true}).then();
        }
      }
    });
  }

  create() {
    this.router.navigate(['mutation_manager/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]).then();
  }

  createNext() {
    this.router.navigate(['mutation_manager/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]).then();
  }

  edit() {
    this.router.navigate(['mutation_manager/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]).then();
  }

  delete() {
    this.service.delete(this.service.selected.id);
  }
}
