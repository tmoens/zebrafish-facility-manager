import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {TransgeneService} from '../transgene.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {TransgeneDto} from "../transgene-dto";
import {ZFTypes} from "../../helpers/zf-types";
import {AppStateService, ZFToolStates} from "../../app-state.service";
import {ZFTool} from '../../helpers/zf-tool';

/**
 * Always view the selected item as held in the service.
 *
 * If explicitly routed to view an item that is not currently selected,
 * make it the selected item. And view it.
 */

@Component({
  selector: 'app-transgene-viewer',
  templateUrl: './transgene-viewer.component.html',
  styleUrls: ['./transgene-viewer.component.scss']
})
export class TransgeneViewerComponent implements OnInit {
  // Build the filter form.
  mfForm = this.fb.group({
    allele: [{value: '', disabled: true}],
    descriptor: [{value: '', disabled: true}],
    comment: [{value: '', disabled: true}],
    name: [null],
    nickname: [{value: '', disabled: true}],
    plasmid: [{value: '', disabled: true}],
    serialNumber: [{value: null, disabled: true}],
    source: [{value: '', disabled: true}],
    spermFreezePlan: [{value: '', disabled: true}],
    vialsFrozen: [{value: 0, disabled: true}],
    zfinId: [{value: '', disabled: true}],

    id: [null],
    isDeletable: [{value: '', disabled: true}],
    fullName: [null],
  });

  constructor(
    private appState: AppStateService,
    private router: Router,
    private route: ActivatedRoute,
    public service: TransgeneService,
    private fb: FormBuilder,
  ) {
    this.service.enterBrowseMode();
  }

  ngOnInit() {
    this.service.selected$.subscribe((selected: TransgeneDto) => {
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
        const storedId = this.appState.getToolState(ZFTypes.TRANSGENE, ZFToolStates.SELECTED_ID);
        if (storedId) {
          this.router.navigateByUrl(ZFTool.TRANSGENE_MANAGER.route + '/view/' + storedId, {replaceUrl: true}).then();
        }
      }
    });
  }

  edit() {
    this.router.navigate([ZFTool.TRANSGENE_MANAGER.route + '/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

}
