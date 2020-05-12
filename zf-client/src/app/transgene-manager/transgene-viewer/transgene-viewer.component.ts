import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {TransgeneService} from '../transgene.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {TransgeneDto} from "../transgene-dto";

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
    nickname: [{value: '', disabled: true}],
    plasmid: [{value: '', disabled: true}],
    source: [{value: '', disabled: true}],
    id: [null],
    serialNumber: [{value: null, disabled: true}],
    isDeletable: [{value: '', disabled: true}],
    name: [null],
    fullName: [null],
    tooltip: [null],
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public service: TransgeneService,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.service.selected$.subscribe((selected: TransgeneDto) => {
      this.service.enterBrowseMode();
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
        // if there is no id in the route, lets see a transgene is already selected and if so, navigate to it.
        if (this.service.selected) {
          this.router.navigateByUrl('transgene_manager/view/' + this.service.selected.id, {replaceUrl: true});
        } else {
          // we were not given an id to view and there is no "selected" id, final try is to
          // navigate to the first iem in the list...
          const firstId = this.service.getFirstFiltered();
          if (firstId) {
            this.router.navigateByUrl('transgene_manager/view/' + firstId, {replaceUrl: true});
          }
        }
      }
    });
  }

  edit() {
    this.router.navigate(['transgene_manager/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

}
