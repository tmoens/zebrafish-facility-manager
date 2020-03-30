import {Component, OnInit} from '@angular/core';
import {classToPlain} from 'class-transformer';
import {FormBuilder} from '@angular/forms';
import {TransgeneService} from '../transgene.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Transgene} from '../transgene';
import {EditMode} from '../../zf-generic/zf-edit-modes';

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
    plasmid: [{value: '', disabled: true}],
    source: [{value: '', disabled: true}],
    id: [null],
    serialNumber: [{value: null, disabled: true}],
    isDeletable: [{value: '', disabled: true}],
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public service: TransgeneService,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.service.selected$.subscribe((selected: Transgene) => {
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
      if (id) { this.service.selectByIdAndLoad(id); }
    });
  }

  create() {
    this.router.navigate(['transgene_manager/' + EditMode.CREATE, {
      mode: EditMode.CREATE,
    }]);
  }

  createNext() {
    this.router.navigate(['transgene_manager/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }

  edit() {
    this.router.navigate(['transgene_manager/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

  delete() {
    this.service.delete(this.service.selected.id);
  }
}
