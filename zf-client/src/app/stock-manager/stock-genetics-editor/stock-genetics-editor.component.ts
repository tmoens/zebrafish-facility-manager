import {Component, OnInit} from '@angular/core';
import {StockFull} from '../stockFull';
import {ZfGenericClass} from '../../zf-generic/zfgeneric-class';
import {ZfSelectionList} from '../../helpers/selection-list';
import {StockService} from '../stock.service';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {DialogService} from "../../dialog.service";
import {FormBuilder, FormControl} from "@angular/forms";
import {MutationService} from "../../mutation-manager/mutation.service";
import {TransgeneService} from "../../transgene-manager/transgene.service";
import {ZFTypes} from "../../helpers/zf-types";
import {Mutation} from "../../mutation-manager/mutation";
import {plainToClass} from "class-transformer";
import {Transgene} from "../../transgene-manager/transgene";
import {Observable} from "rxjs";

/**
 * This dialog allows the user to indicate which mutations/transgenes (markers) are present
 * in a particular stock.  The user is presented with check boxes to choose from
 * markers present in the parent stock (normal case). The user is also given the
 * opportunity to look up and add non-parental mutations which happens a) when a
 * new marked was introduced or b) when a stock is imported from another lab and
 * markers have to be added.
 */

@Component({
  selector: 'app-stock-genetics-editor',
  templateUrl: './stock-genetics-editor.component.html',
  styleUrls: ['./stock-genetics-editor.component.scss']
})
export class StockGeneticsEditorComponent implements OnInit {
  id: number;
  type: string; // mutation or transgene

  // The stock in question
  stock: StockFull;

  // The markers of both parental stocks
  parentalSelectionList: ZfSelectionList<ZfGenericClass>;

  // A list of markers which the stock has but were not inherited from parents
  nonParentalSelectionList: ZfSelectionList<ZfGenericClass>;

  // working copy of the markers of the stock in question
  ownList: ZfSelectionList<ZfGenericClass>;

  // for checking if the ownList has changed
  initialList: ZfGenericClass[];

  // whether or not the working copy differs from the initial
  ownListChanged = false;

  // This is a filtered list of markers that allows the user to efficiently
  // find the one she wants without having to go the the mutation manager
  // or transgene manager and make a note. It gets updated as the user
  // enters a filter string.
  lookupList: ZfSelectionList<ZfGenericClass> = new ZfSelectionList<ZfGenericClass>();

  // The filter string;
  filterStringFC: FormControl = new FormControl('');

  // To present Mutation/Transgene in the GUI rather than mutation/transgene
  // Please excuse the expedience
  capitalizedType: string;

  // used to check if it is safe to navigate away after a save
  saved = false;

  constructor(
    private fb: FormBuilder,
    public service: StockService,
    public mutationService: MutationService,
    public transgeneService: TransgeneService,
    private route: ActivatedRoute,
    private router: Router,
    private deactivationDialogService: DialogService,
  ) {
  }

  ngOnInit() {
    // watch for changes to the paramMap (i.e. changes to the route)
    this.route.paramMap.subscribe((pm: ParamMap) => {
      this.service.enterEditMode(); // tucks away the stock selector.
      this.id = Number(pm.get('id'));
      this.type = pm.get('type');
      this.capitalizedType = this.type.charAt(0).toUpperCase() + this.type.slice(1);
      this.service.getById(this.id).subscribe((s: StockFull) => {
        this.stock = s;
        this.initialize();
      });
    });

    // watch the filter string for changes and load the lookup list accordingly
    this.filterStringFC.valueChanges.subscribe((filter: string) => this.loadLookupList(filter));
  }

  initialize() {

    this.ownList = new ZfSelectionList<ZfGenericClass>();
    this.parentalSelectionList = new ZfSelectionList<ZfGenericClass>();
    this.nonParentalSelectionList = new ZfSelectionList<ZfGenericClass>();

    // Initialization uses different tools for Mutations and Transgenes...
    switch (this.type) {
      case ZFTypes.MUTATION:
        this.initialList = this.stock.mutations;

        // The stock's own list starts with whatever markers the stock has.
        this.stock.mutations.map((item: ZfGenericClass) => {
          this.ownList.insert(plainToClass(Mutation, item), true);
        });

        // The parental list is fetched, and any markers the child has are selected.
        this.service.getParentalMutations().map((item: ZfGenericClass) => {
          this.parentalSelectionList.insert(item, this.ownList.contains(item));
        });

        // If the stock has any markers that neither parent has, these are "additional"
        // or "non parental" markers.
        this.stock.mutations.map((item: ZfGenericClass) => {
          if (!this.parentalSelectionList.containsId(item.id)) {
            this.nonParentalSelectionList.insert(plainToClass(Mutation, item), true);
          }
        });
        break;

      case ZFTypes.TRANSGENE:
        this.initialList = this.stock.transgenes;

        // The stock's own list starts with whatever markers the stock has.
        this.stock.transgenes.map((item: ZfGenericClass) => {
          this.ownList.insert(plainToClass(Transgene, item), true);
        });

        // The parental list is fetched, and any markers the child has are selected.
        this.service.getParentalTransgenes().map((item: ZfGenericClass) => {
          this.parentalSelectionList.insert(item, this.ownList.contains(item));
        });

        // If the stock has any markers that neither parent has, these are "additional"
        // or "non parental" markers.
        this.stock.transgenes.map((item: ZfGenericClass) => {
          if (!this.parentalSelectionList.containsId(item.id)) {
            this.nonParentalSelectionList.insert(plainToClass(Transgene, item), true);
          }
        });
        break;

    }
    this.hasOwnListChanged();
  }

  loadLookupList(filter: string) {
    this.lookupList = new ZfSelectionList<ZfGenericClass>();

    // to keep the GUI performant, require the search string to be at least two characters.
    if (filter.length <2) { return; }
    const f =  filter.toLowerCase();

    switch (this.type) {
      case ZFTypes.MUTATION:


        this.mutationService.all.map((m: Mutation) => {
          if ((m.gene && m.gene.toLowerCase().includes(f)) ||
            (m.name && m.name.toLowerCase().includes(f)) ||
            (m.researcher && m.researcher.toLowerCase().includes(f))) {

            // fill the lookup list and select any markers that are present in the stock.
            this.lookupList.insert(m, this.ownList.containsId(m.id));
          }
        });

        break;

      case ZFTypes.TRANSGENE:
        // for transgenes, we can load them all, so we do not demand any length
        // of filter string.
        this.transgeneService.all.map((m: Transgene) => {
          if (m.allele && m.allele.toLowerCase().includes(f) ||
            (m.descriptor && m.descriptor.toLowerCase().includes(f))) {
            this.lookupList.insert(m, this.ownList.containsId(m.id));
          }
        });
        break;
    }
  }


  save() {
    switch (this.type) {
      case ZFTypes.MUTATION:
        this.stock.mutations = this.ownList.getList() as Mutation[];
        break;
      case ZFTypes.TRANSGENE:
        this.stock.transgenes = this.ownList.getList() as Transgene[];
        break;
    }
    this.service.update(this.stock);
    this.saved = true;
  }

  revert() {
    this.initialize();
  }

  cancel() {
    this.router.navigate(['stock_manager/view']);
  }

  hasOwnListChanged(): boolean {
    // If there are different numbers in the two, there is a change
    if (this.ownList.count !== this.initialList.length) {
      this.ownListChanged = true;
      return this.ownListChanged;
    }

    // if any one of the initial list is not in the new list, there is a change
    for (const item of this.initialList) {
      if (!this.ownList.containsId(item.id)) {
        this.ownListChanged = true;
        return this.ownListChanged;
      }
    }
    this.ownListChanged = false;
    return this.ownListChanged;
  }

  onCheckParentalItem(item: ZfGenericClass, selected: boolean) {
    if (selected) {
      this.ownList.insert(item, true);
    } else {
      this.ownList.removeId(item.id);
    }
    this.lookupList.toggleId(item.id)
    this.hasOwnListChanged();
  }

  onCheckNonParentalItem(item: ZfGenericClass) {
    this.ownList.removeId(item.id);
    this.parentalSelectionList.toggleId(item.id)
    this.nonParentalSelectionList.removeId(item.id);
    this.lookupList.toggleId(item.id)
    this.hasOwnListChanged();
  }

  onCheckLookupItem(item: ZfGenericClass, selected: boolean) {
    if (selected) {
      this.ownList.insert(item, true);
      this.nonParentalSelectionList.insert(item, true);
    } else {
      this.ownList.removeId(item.id);
      this.nonParentalSelectionList.removeId(item.id);
    }
    this.parentalSelectionList.toggleId(item.id)

    this.hasOwnListChanged();
  }

  /* To support deactivation check  */
  /* Contrary to tsLint's perspective, this function *is* invoked by the deactivation guard */
  canDeactivate(): boolean | Observable<boolean> |Promise <boolean> {
    if (!this.hasOwnListChanged() || this.saved) {
      return true;
    } else {
      return this.deactivationDialogService.confirm('There are unsaved changes to the transgene you are editing.');
    }
  }

}
