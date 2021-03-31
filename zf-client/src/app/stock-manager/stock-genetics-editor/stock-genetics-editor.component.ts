import {Component, OnInit} from '@angular/core';
import {ZfSelectionList} from '../../helpers/selection-list';
import {StockService} from '../stock.service';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {DialogService} from "../../dialog.service";
import {FormBuilder, FormControl} from "@angular/forms";
import {MutationService} from "../../mutation-manager/mutation.service";
import {TransgeneService} from "../../transgene-manager/transgene.service";
import {Observable} from "rxjs";
import {StockFullDto} from "../dto/stock-full-dto";
import {classToClass} from "class-transformer";
import {MutationDto} from "../../mutation-manager/mutation-dto";
import {TransgeneDto} from "../../transgene-manager/transgene-dto";
import {debounceTime, startWith} from "rxjs/operators";
import {ScreenSizes} from "../../helpers/screen-sizes";
import {AppStateService} from "../../app-state.service";
import {ZFTool} from '../../helpers/zf-tool';

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
  ScreenSizes = ScreenSizes;

  id: number;
  highlightId: number;

  // form controls for adding novel mutations and transgenes
  newMutationFC: FormControl = new FormControl();
  newTransgeneFC: FormControl = new FormControl();

  // lists of mutations and transgenes that support the autocomplete
  // form controls.  They hold lists that grow and shrink as the user
  // types in the "Add mutation" or "Add Transgene" autocomplete FCs.
  mutationOptions: MutationDto[];
  transgeneOptions: TransgeneDto[];

  // The stock whose mutations and transgenes we are editing.
  stock: StockFullDto;

  // The markers of both parental stocks
  parentalMutations: ZfSelectionList<MutationDto>;
  parentalTransgenes: ZfSelectionList<TransgeneDto>;

  // A list of markers which the stock has but were not inherited from parents
  nonParentalMutations: ZfSelectionList<MutationDto>;
  nonParentalTransgenes: ZfSelectionList<TransgeneDto>;

  // working copy of the markers of the stock in question
  ownTransgenes: ZfSelectionList<TransgeneDto>;
  ownMutations: ZfSelectionList<MutationDto>;

  // for checking if the ownList has changed
  initialMutations: MutationDto[];
  initialTransgenes: TransgeneDto[];

  // whether or not the working copy differs from the initial
  ownListChanged = false;

  // To present Mutation/Transgene in the GUI rather than mutation/transgene
  // Please excuse the expedience
  capitalizedType: string;

  // used to check if it is safe to navigate away before a save
  saved = false;

  constructor(
    public appState: AppStateService,
    private fb: FormBuilder,
    public service: StockService,
    public mutationService: MutationService,
    public transgeneService: TransgeneService,
    private route: ActivatedRoute,
    private router: Router,
    private deactivationDialogService: DialogService,
  ) {
    this.service.enterEditMode(); // tucks away the stock selector.
  }

  ngOnInit() {
    // watch for changes to the paramMap (i.e. changes to the route parameters)
    this.route.paramMap.subscribe((pm: ParamMap) => {
      this.id = Number(pm.get('id'));
      this.service.getById(this.id).subscribe((s: StockFullDto) => {
        this.stock = s;
        this.initialize();
      });
    });


  }

  initialize() {
    // the mutation filter can be a specific MutationDto or a string.
    this.newMutationFC.valueChanges.pipe(
      startWith(''),
      debounceTime(300)).subscribe((value: string | MutationDto) => {
        if (typeof (value) === 'string') {
          // if the filter is a string get a list of mutations that match the string
          // to be used as auto-complete options for the mutation filter.
          this.mutationOptions = this.mutationService.getListFilteredByString(value);
        } else {
          this.onAddMutation(value);
          this.newMutationFC.setValue('');
        }
      }
    );

    // the transgene filter can be a specific TransgeneDTO or a string.
    this.newTransgeneFC.valueChanges.pipe(
      startWith(''),
      debounceTime(300)).subscribe((value: string | TransgeneDto) => {
        if (typeof (value) === 'string') {
          // if the filter is a string get a list of transgenes that match the string
          // to be used as auto-complete options for the transgene filter.
          this.transgeneOptions = this.transgeneService.getListFilteredByString(value);
        } else {
          this.onAddTransgene(value);
          this.newTransgeneFC.setValue('');
        }
      }
    );

    this.ownMutations = new ZfSelectionList<MutationDto>();
    this.parentalMutations = new ZfSelectionList<MutationDto>();
    this.nonParentalMutations = new ZfSelectionList<MutationDto>();
    this.ownTransgenes = new ZfSelectionList<TransgeneDto>();
    this.parentalTransgenes = new ZfSelectionList<TransgeneDto>();
    this.nonParentalTransgenes = new ZfSelectionList<TransgeneDto>();

    this.initialMutations = this.stock.mutations;
    this.initialTransgenes = this.stock.transgenes;

    // The stock's own list starts with whatever markers the stock has.
    this.stock.mutations.map((item: MutationDto) => {
      this.ownMutations.insert(classToClass(item), true);
    });

    // The parental list is fetched, and any markers the child has are selected.
    this.service.getParentalMutations().map((item: MutationDto) => {
      this.parentalMutations.insert(item, this.ownMutations.containsId(item.id));
    });

    // If the stock has any markers that neither parent has, these are "additional"
    // or "non parental" markers.
    this.stock.mutations.map((item: MutationDto) => {
      if (!this.parentalMutations.containsId(item.id)) {
        this.nonParentalMutations.insert(classToClass(item), true);
      }
    });


    // The stock's own list starts with whatever markers the stock has.
    this.stock.transgenes.map((item: TransgeneDto) => {
      this.ownTransgenes.insert(classToClass(item), true);
    });

    // The parental list is fetched, and any markers the child has are selected.
    this.service.getParentalTransgenes().map((item: TransgeneDto) => {
      this.parentalTransgenes.insert(item, this.ownTransgenes.containsId(item.id));
    });

    // If the stock has any markers that neither parent has, these are "additional"
    // or "non parental" markers.
    this.stock.transgenes.map((item: TransgeneDto) => {
      if (!this.parentalTransgenes.containsId(item.id)) {
        this.nonParentalTransgenes.insert(classToClass(item), true);
      }
    });

    this.hasOwnListChanged();
  }


  save() {
    this.stock.mutations = this.ownMutations.getList() as MutationDto[];
    this.stock.transgenes = this.ownTransgenes.getList() as TransgeneDto[];
    this.service.update(this.stock);
    this.saved = true;
  }

  revert() {
    this.initialize();
  }

  cancel() {
    this.router.navigate([ZFTool.STOCK_MANAGER.route + '/view']).then();
  }

  hasOwnListChanged(): boolean {
    // If there are different numbers between the initial and current lists, there is a change
    if (this.ownTransgenes.count !== this.initialTransgenes.length ||
      this.ownMutations.count !== this.initialMutations.length) {
      this.ownListChanged = true;
      return this.ownListChanged;
    }

    // if any one of the initial list is not in the new list, there is a change
    for (const item of this.initialTransgenes) {
      if (!this.ownTransgenes.containsId(item.id)) {
        this.ownListChanged = true;
        return this.ownListChanged;
      }
    }
    for (const item of this.initialMutations) {
      if (!this.ownMutations.containsId(item.id)) {
        this.ownListChanged = true;
        return this.ownListChanged;
      }
    }
    this.ownListChanged = false;
    return this.ownListChanged;
  }

  onCheckParentalMutation(item: MutationDto, selected: boolean) {
    if (selected) {
      this.ownMutations.insert(item, true);
      this.parentalMutations.insert(item, true);
    } else {
      this.ownMutations.removeId(item.id);
    }
    this.hasOwnListChanged();
  }

  onCheckParentalTransgene(item: TransgeneDto, selected: boolean) {
    if (selected) {
      this.ownTransgenes.insert(item, true);
    } else {
      this.ownTransgenes.removeId(item.id);
    }
    this.hasOwnListChanged();
  }

  onAddMutation(item: MutationDto) {
    if (this.parentalMutations.containsId(item.id)) {
      this.onCheckParentalMutation(item, true);
    } else if (!this.nonParentalMutations.containsId(item.id)) {
      this.ownMutations.insert(item, true);
      this.nonParentalMutations.insert(item, true);
    }
    this.hasOwnListChanged();
  }

  onAddTransgene(item: TransgeneDto) {
    if (this.parentalTransgenes.containsId(item.id)) {
      this.onCheckParentalTransgene(item, true);
    } else if (!this.nonParentalTransgenes.containsId(item.id)) {
      this.ownTransgenes.insert(item, true);
      this.nonParentalTransgenes.insert(item, true);
    }
    this.hasOwnListChanged();
  }

  onDeleteNonParentalMutation(item: MutationDto) {
    this.ownMutations.removeId(item.id);
    this.nonParentalMutations.removeId(item.id)
    this.hasOwnListChanged();
  }

  onDeleteNonParentalTransgene(item: TransgeneDto) {
    this.ownTransgenes.removeId(item.id);
    this.nonParentalTransgenes.removeId(item.id)
    this.hasOwnListChanged();
  }


  /* To support deactivation check  */

  /* Contrary to tsLint's perspective, this function *is* invoked by the deactivation guard */
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (!this.hasOwnListChanged() || this.saved) {
      return true;
    } else {
      return this.deactivationDialogService.confirm('There are unsaved changes to the transgene you are editing.');
    }
  }

}
