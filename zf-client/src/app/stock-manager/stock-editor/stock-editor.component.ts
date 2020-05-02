import {Component, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Stock} from '../stock';
import {StockFull} from '../stockFull';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {classToClass, classToPlain, plainToClass} from 'class-transformer';
import {DialogService} from '../../dialog.service';
import {Observable} from 'rxjs';
import {MAT_DATE_FORMATS} from "@angular/material/core";
import {ZF_DATE_FORMATS} from "../../helpers/dateFormats";
import * as moment from 'moment';
import {FormControl} from "@angular/forms";
import {AppStateService} from "../../app-state.service";


@Component({
  selector: 'app-stock-editor',
  templateUrl: './stock-editor.component.html',
  styleUrls: ['./stock-editor.component.scss'],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: ZF_DATE_FORMATS},
  ],
})


export class StockEditorComponent implements OnInit {
  // EDIT the stock, CREATE the stock, or CREATE a sub-stock from the stock
  editMode: EditMode;

  // The id of the stock we are meant to edit (EDIT mode only)
  stockId: number;

  // The stock we are meant to edit (EDIT mode only)
  initialStock: StockFull;

  // The stock from which we are creating a sub-stock (CREATE_SUB_STOCK mode only)
  baseStock: StockFull;

  // Putative parental stock (CREATE mode only)
  putativeParentalStock: StockFull = null;

  // holds the working copy of the stock we are editing.
  stock: StockFull;

  // Title for the editor screen
  title: string;

  // convenience variables
  momInternal: boolean = true;
  dadInternal: boolean = true;

  // the list of known researchers that match what has been entered in
  // the researcher field so far
  filteredResearcherOptions: string[];
  filteredPIOptions: string[];
  saved = false;

  constructor(
    public appState: AppStateService,
    public service: StockService,
    private route: ActivatedRoute,
    private router: Router,
    private deactivationDialogService: DialogService,

  ) {}

  ngOnInit() {
    // watch for changes to the paramMap (i.e. changes to the route)
    this.route.paramMap.subscribe((pm: ParamMap) => {
      switch (pm.get('mode')) {
        case EditMode.EDIT:
          this.stockId = +pm.get('id');
          this.service.getById(this.stockId).subscribe((s: StockFull) => {
            this.initialStock = s;
            this.initializeForEdit();
          });
          break;
        case EditMode.CREATE_NEXT:
          // 2020-04-26 The below proved to be just plain wrong.  So, no putative parent.
          // // Make a guess that both parents are the stock that was selected at the time the
          // // editor was initially invoked.
          // // It's gonna be a bad guess fairly often, at least for one of the parents,
          // // but it is better than nothing and it could be dead right pretty often too.
          // // Corner case note. If the user reloads the browser during a CREATE_NEXT,
          // // there will be no selected stock, so no putative parent can be filled in.
          // if (this.service.selected) {
          //   this.putativeParentalStock = classToClass(this.service.selected);
          // } else {
          //   this.putativeParentalStock = null;
          // }
          this.putativeParentalStock = null;
          this.initializeForCreate();
          break;
        case EditMode.CREATE_SUB_STOCK:
          this.service.getById(this.service.selected.id).subscribe((s: StockFull) => {
            this.baseStock = s;
            this.initializeForCreateSubStock();
          });
          break;
      }
    });
  }


  // When editing an existing selected, make a working copy from the initial selected.
  initializeForEdit() {
    this.editMode = EditMode.EDIT;
    this.stock = classToClass(this.initialStock);
    this.title = 'Editing Stock ' + this.stock.name;
    this.prepParents();
  }

  // When creating a new stock, the working copy is empty, but
  // take a few educated guesses about the attributes.
  initializeForCreate() {
    this.editMode = EditMode.CREATE_NEXT;
    this.stock = new StockFull();
    this.stock.parentsEditable = true;
    this.momInternal = true;
    this.dadInternal = true;
    // the selected number is kind of a guess because some other user
    // may come along and create a stock first.  At least it gives
    // the user a clear view of what she is doing.
    this.stock.number = Number(this.service.likelyNextStockNumber);
    this.stock.subNumber = 0;
    this.stock.name = String(this.stock.number);
    // if (this.putativeParentalStock) {
    //   const temp = classToPlain(this.putativeParentalStock);
    //   this.stock.matIdInternal = this.putativeParentalStock.id;
    //   this.stock.matStock = plainToClass(Stock, temp);
    //   this.stock.patIdInternal = this.putativeParentalStock.id;
    //   this.stock.patStock = plainToClass(Stock, temp);
    // }

    this.title = 'Creating Stock ' + this.stock.name;
    this.prepParents();
  }

  // When creating a new subStock, begin with a copy of the currently selected stock
  // and update the subStock number accordingly.
  initializeForCreateSubStock() {
    this.editMode = EditMode.CREATE_SUB_STOCK;
    this.stock = classToClass(this.baseStock);
    this.stock.id = null; // can't reuse the initial selected's id.
    this.stock.subNumber = this.baseStock.nextSubStockNumber;
    this.stock.nextSubStockNumber++; // required: ensures parents and fertilizationDate not editable.
    this.stock.name = this.stock.number + '.' + this.stock.subNumber;
    // when creating a sub-selected, we get the transgenes and mutations automatically
    // but we need to make sure we don't get any live instances in tanks.
    this.stock.swimmers = [];
    this.title = 'Creating Sub-Stock ' + this.stock.name;
    this.prepParents();
  }

  prepParents() {
    if (!this.stock.matStock) { this.stock.matStock = new Stock(); }
    if (!this.stock.patStock) { this.stock.patStock = new Stock(); }
    this.momInternal = !!this.stock.matIdInternal;
    this.dadInternal = !!this.stock.patIdInternal;
    this.filteredResearcherOptions =
      this.service.fieldOptions.filterOptionsContaining('researcher', this.stock.researcher);
    this.filteredResearcherOptions =
      this.service.fieldOptions.filterOptionsContaining('pi', this.stock.pi);
  }

  onResearcherChange() {
    this.filteredResearcherOptions =
      this.service.fieldOptions.filterOptionsContaining('researcher', this.stock.researcher);
  }

  onPIChange() {
    this.filteredPIOptions =
      this.service.fieldOptions.filterOptionsContaining('pi', this.stock.pi);
  }

  onSetMatStock() {
    this.service.getByName(this.stock.matStock.name).subscribe((s: Stock) => {
      if (s && s.id) {
        this.stock.matIdInternal = s.id;
        this.stock.matStock = s;
      } else {
        const name = this.stock.matStock.name;
        this.stock.matStock = new Stock();
        this.stock.matStock.name = name;
      }
    });
  }

  onSetPatStock() {
    this.service.getByName(this.stock.patStock.name).subscribe((s: Stock) => {
      if (s && s.id) {
        this.stock.patIdInternal = s.id;
        this.stock.patStock = s;
      } else {
        const name = this.stock.patStock.name;
        this.stock.patStock = new Stock();
        this.stock.patStock.name = name;
      }
    });
  }

  save() {
    this.saved = true;
    // if the parent is internal, clear the external id and descriptor and vice versa
    if (this.momInternal) {
      this.stock.externalMatDescription = null;
      this.stock.externalMatId = null;
    } else {
      this.stock.matIdInternal = null;
      this.stock.matStock = null;
    }
    if (this.dadInternal) {
      this.stock.externalPatDescription = null;
      this.stock.externalPatId = null;
    } else {
      this.stock.patIdInternal = null;
      this.stock.patStock = null;
    }
    switch (this.editMode) {
      case EditMode.CREATE_NEXT:
        this.service.create(this.stock);
        break;
      case EditMode.CREATE_SUB_STOCK:
        this.service.createSubStock(this.stock);
        break;
      case EditMode.EDIT:
        this.service.update(this.stock);
        break;
    }
  }

  cancel() {
    this.router.navigateByUrl('stock_manager/view');
  }

  revert() {
    switch (this.editMode) {
      case EditMode.EDIT:
        this.initializeForEdit();
        break;
      case EditMode.CREATE_NEXT:
        this.initializeForCreate();
        break;
      case EditMode.CREATE_SUB_STOCK:
        this.initializeForCreateSubStock();
        break;
    }
  }

  /* To support deactivation check  */
  canDeactivate(): boolean | Observable<boolean> |Promise <boolean> {
    if (this.isUnchanged()) {
      return true;
    } else {
      return this.deactivationDialogService.confirm('There are unsaved changes to the stock you are editing.');
    }
  }

  // Check if any of the fields have been changed by the user.
  isUnchanged(): boolean {
    if (this.saved) { return true; }
    switch (this.editMode) {
      case EditMode.EDIT:
        if (
          this.stock.description !== this.initialStock.description ||
          this.stock.pi !== this.initialStock.pi ||
          this.stock.researcher !== this.initialStock.researcher ||
          this.stock.fertilizationDate !== this.initialStock.fertilizationDate ||
          this.stock.comment !== this.initialStock.comment) {
          return false;
        }
        if (this.momInternal) {
          if (this.stock.matIdInternal !== this.initialStock.matIdInternal) {
            return false;
          }
        }
        if (this.dadInternal) {
          if (this.stock.patIdInternal !== this.initialStock.patIdInternal) {
            return false;
          }
        }
        if (!this.momInternal) {
          if (
            this.stock.externalMatId !== this.initialStock.externalMatId ||
            this.stock.externalMatDescription !== this.initialStock.externalMatDescription
          ) {
            return false;
          }
        }
        if (!this.dadInternal) {
          if (
            this.stock.externalMatId !== this.initialStock.externalPatId ||
            this.stock.externalMatDescription !== this.initialStock.externalPatDescription
          ) {
            return false;
          }
        }
        return true;
      case EditMode.CREATE_NEXT:
        // because most of the fields start as empty, if anything is in them, it's touched.
        if (
          this.stock.description ||
          this.stock.pi ||
          this.stock.researcher ||
          this.stock.fertilizationDate ||
          this.stock.comment ||
          !this.momInternal ||
          !this.dadInternal
        ) {
          return false;
        }
        if (this.putativeParentalStock) {
          if ((this.stock.matIdInternal !== this.putativeParentalStock.id) ||
            (this.stock.patIdInternal !== this.putativeParentalStock.id)) {
            return false;
          } else {
            if (this.stock.patIdInternal || this.stock.matIdInternal) {
              return false;
            }
          }
        }
        return true;
      case EditMode.CREATE_SUB_STOCK:
        // when creating a sub-stock, it is automatically deemed to be "changed"
        // because it has a new sub-stock number.
        return false;
    }
    return true;
  }
}
