import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StockFull} from '../stockFull';
import {ZfGenericClass} from '../../zf-generic/zfgeneric-class';
import {ZfSelectionList} from '../../helpers/selection-list';
import {StockService} from '../stock.service';
import {Mutation} from '../../mutation-manager/mutation';
import {Transgene} from '../../transgene-manager/transgene';
import {classToClass} from 'class-transformer';
import {ZFTypes} from "../../helpers/zf-types";
import {Router} from "@angular/router";

/**
 * This dialog allows the user to indicate which mutations/transgenes are present
 * in a particular stock.  The user is presented with check boxes to choose from
 * mutations/transgenes present in the parent stock (normal case) or novel
 * mutations/transgenes not present in the parent stock (but present in the system).
 */

@Component({
  selector: 'app-stock-genetics-editor',
  templateUrl: './stock-genetics-editor.component.html',
  styleUrls: ['./stock-genetics-editor.component.scss']
})
export class StockGeneticsEditorComponent implements OnInit {
  stock: StockFull;
  ownSelectionList: ZfSelectionList<ZfGenericClass>;
  ownListChanged = false;
  parentalSelectionList: ZfSelectionList<ZfGenericClass>;
  fullSelectionList: ZfSelectionList<ZfGenericClass>;
  filterString: string;

  constructor(
    public dialogRef: MatDialogRef<StockGeneticsEditorComponent>,
    public service: StockService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      // Are we dealing with Mutations or Transgenes
      type: ZFTypes;

      // the stock whose mutations/transgenes we are editing
      stock: StockFull;

      // the list of mutations/transgenes from both parents combined.
      parentalList: ZfGenericClass[];

      // the list of all mutations/transgenes (supplied by the corresponding service)
      fullList: ZfGenericClass[];

      // the list of mutations/transgenes contained in this stock.
      // This component is strictly about editing this list.
      ownList: ZfGenericClass[];
    },
  ) {
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.stock = classToClass(this.data.stock);
    this.ownSelectionList = new ZfSelectionList<ZfGenericClass>();
    this.parentalSelectionList = new ZfSelectionList<ZfGenericClass>();
    this.fullSelectionList = new ZfSelectionList<ZfGenericClass>();

    this.filterString = '';

    this.data.ownList.map((item: ZfGenericClass) => {
      this.ownSelectionList.insert(item, true);
    });

    this.data.parentalList.map((item: ZfGenericClass) => {
      this.parentalSelectionList.insert(item, this.ownSelectionList.contains(item));
    });

    // When building the full selection list, leave out items that are in the parental list.
    this.data.fullList.map((item: ZfGenericClass) => {
      if (!this.parentalSelectionList.contains(item)) {
        this.fullSelectionList.insert(item, this.ownSelectionList.contains(item));
      }
    });
  }

  save() {
    switch (this.data.type) {
      case ZFTypes.MUTATION:
        this.stock.mutations = this.ownSelectionList.getList() as Mutation[];
        break;
      case ZFTypes.TRANSGENE:
        this.stock.transgenes = this.ownSelectionList.getList() as Transgene[];
        break;
    }
    this.service.update(this.stock);
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }

  revert() {
    this.initialize();
  }

  hasOwnListChanged(): boolean {
    if (this.data.ownList.length !== this.ownSelectionList.count) {
      this.ownListChanged = true;
      return;
    }
    for (const item of this.data.ownList) {
      if (!this.ownSelectionList.contains(item)) {
        this.ownListChanged = true;
        return;
      }
    }
    this.ownListChanged = false;
  }

  // Distinguishes between items that come from the parent or are novel to the stock
  isInherited(item: ZfGenericClass) {
    return !!(this.parentalSelectionList.contains(item));
  }

  // If the user clicks a parental item
  // if the item is in the stock's own list, remove it otherwise add it.
  onCheckParentalItem(item: ZfGenericClass) {
    if (this.ownSelectionList.contains(item)) {
      this.ownSelectionList.remove(item);
    } else {
      this.ownSelectionList.insert(item, true);
    }
    this.hasOwnListChanged();
  }
  // If the user clicks a mutation in the filtered list,
  // if the mutation is in the selected's list, remove it otherwise add it.
  onCheckFilteredItem(item: ZfGenericClass) {
    if (this.ownSelectionList.contains(item)) {
      this.ownSelectionList.remove(item);
    } else {
      this.ownSelectionList.insert(item, true);
    }
    this.hasOwnListChanged();
  }
}
