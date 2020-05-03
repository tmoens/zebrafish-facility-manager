import {Component, OnInit} from '@angular/core';
import {TankService} from '../../tank-manager/tank.service';
import {StockService} from '../stock.service';
import {FormBuilder, Validators} from '@angular/forms';
import {StockSwimmerDto} from '../../tank-manager/stock-swimmer-dto';
import {SwimmerFullDto} from '../../tank-manager/swimmer-full-dto';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Location} from '@angular/common';
import {forkJoin, Observable} from 'rxjs';
import {DialogService} from '../../dialog.service';
import {AppStateService} from "../../app-state.service";

/**
 * This Component allows the user to indicate tanks a particular stock is in.
 */

enum SwimmerState {
  UNCHANGED = 'unchanged',
  NEW = 'to be added',
  DELETED = 'to be deleted',
  MODIFIED = 'modified',
}

@Component({
  selector: 'app-stock-swimmer-editor',
  templateUrl: './stock-swimmers-editor.component.html',
  styleUrls: ['./stock-swimmers-editor.component.scss']
})
export class StockSwimmersEditorComponent implements OnInit {
  stockId: number;
  SwimmerState = SwimmerState; // this makes the enum available in templates.
  originalSwimmers: StockSwimmerDto[];
  swimmers: {[tankid: number]: {swimmer: StockSwimmerDto, originalSwimmer: StockSwimmerDto, state: SwimmerState}};

  needsSaving: boolean;

  addSwimmerForm = this.fb.group( {
    tankName: ['', Validators.required],
    swimmerCount: [1, [Validators.min(1), Validators.required]],
    comment: [''],
  });

  get swimmerCountFC() {
    return this.addSwimmerForm.get('swimmerCount');
  }
  get tankNameFC() {
    return this.addSwimmerForm.get('tankName');
  }
  get commentFC() {
    return this.addSwimmerForm.get('comment');
  }

  // When adding a swimmer, the user needs to know if the tank they have selected already
  // has another stock or stocks in it.
  cohabitants: SwimmerFullDto[];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public appState: AppStateService,
    public stockService: StockService,
    public tankService: TankService,
    private _location: Location,
    private deactivationDialogService: DialogService,
  ) {
  }

  ngOnInit() {
    // In the route, We get passed the id of the stock whose swimmers we need to edit.
    // We make sure that the stockService has that stock in focus by selecting it.
    this.route.paramMap.subscribe((pm: ParamMap) => {
      this.stockService.enterEditMode();
      this.stockId = +pm.get('id');
      if (this.stockId && (!this.stockService.selected || this.stockId !== this.stockService.selected.id)) {
        this.stockService.setSelectedId(this.stockId);
        this.stockService.loadSelected();
      }
    });

    // in case the selected stock changes (maybe we even changed it) we need
    // to initialize the data for this Component.
    this.stockService.selected$.subscribe(_ => {
        this.initialize();
      }
    );

    this.tankNameFC.statusChanges.subscribe(_ => this.onTankNameChange());
  }

  initialize() {
    this.needsSaving = false;

    // We might get called when no stock is selected - just ignore it.
    // We are pretty confident that a stock will be selected shortly and
    // then we LEAP into action.
    if (!this.stockService.selected) { return; }
    // make a copy of the swimmers in the selected stock (we do not operate on them directly).
    this.originalSwimmers = this.stockService.selected.swimmers.map(s => ({...s}));
    this.swimmers = {};
    this.stockService.selected.swimmers.map((s: StockSwimmerDto) => {
      this.swimmers[s.tankId] = {swimmer: Object.assign(new StockSwimmerDto(), s), originalSwimmer: s, state: SwimmerState.UNCHANGED};
    });
    this.cohabitants = [];
    this.clearNewSwimmer();
  }

  clearNewSwimmer() {
    this.addSwimmerForm.reset();
    this.swimmerCountFC.setValue(1);
  }

  addNewSwimmer() {
    const newSwimmer = new StockSwimmerDto();
    newSwimmer.stockId = this.stockService.selected.id;
    newSwimmer.tank = this.tankService.getTankByName(this.tankNameFC.value);
    newSwimmer.tankId = newSwimmer.tank.id;
    newSwimmer.number = this.swimmerCountFC.value;
    newSwimmer.comment = this.commentFC.value;
    this.originalSwimmers.push(newSwimmer);
    this.swimmers[newSwimmer.tankId] = {swimmer: newSwimmer, originalSwimmer: null, state: SwimmerState.NEW};
    this.clearNewSwimmer();
    this.checkState();
  }

  // When the user hits the delete button, it could mean a couple of things
  // If the swimmer is "new" i.e. scheduled for addition, we can just delete it because it was not
  // yet added.
  // Otherwise we mark it as deleted.
  onSwimmerDelete(tankId: string) {
    if (this.swimmers[tankId].state === SwimmerState.NEW) {
      delete this.swimmers[tankId];
    } else {
      this.swimmers[tankId].state = SwimmerState.DELETED;
    }
    this.checkState();
  }

  // When the user changes a count or comment for a swimmer
  // If the swimmer is "new" i.e. scheduled for addition, we can just delete it because it was not
  // yet added.
  // Otherwise we mark it as deleted.
  onSwimmerChange(tankId: string) {
    switch (this.swimmers[tankId].state) {
      case SwimmerState.NEW:
        // changing a new swimmer is still a new swimmer.
        break;
      case SwimmerState.DELETED:
        // The GUI tries to prevent this, but changing a deleted swimmer does not
        // change the state from deleted.
        break;
      case SwimmerState.UNCHANGED:
      case SwimmerState.MODIFIED:
        if (this.compareSwimmers(this.swimmers[tankId].swimmer, this.swimmers[tankId].originalSwimmer)) {
          this.swimmers[tankId].state = SwimmerState.UNCHANGED;
        } else {
          this.swimmers[tankId].state = SwimmerState.MODIFIED;
        }
    }
    this.checkState();
  }

  compareSwimmers(s1: StockSwimmerDto, s2: StockSwimmerDto) {
    return !!(s1.tankId === s2.tankId && s1.stockId === s2.stockId &&
      s1.comment === s2.comment && s1.number === s2.number);
  }

  checkState() {
    this.needsSaving = false;
    for (const s of Object.values(this.swimmers)) {
      if (s.state !== SwimmerState.UNCHANGED) {
        this.needsSaving = true;
        break;
      }
    }
  }

  // When a user types in a tank name for a new swimmer, we need to check if that particular
  // tank has other swimmers from other stocks in it to keep the user from inadvertently
  // assigning multiple stocks to a single tank.
  onTankNameChange() {
    if (this.tankNameFC.valid) {
      this.tankService.getSwimmers(this.tankNameFC.value).subscribe((swimmers: SwimmerFullDto[]) => {
        this.cohabitants = swimmers;
      });
    } else {
      this.cohabitants = [];
    }
  }

  getTankNameErrorMessage(): string {
    if (this.tankNameFC.errors.invalidTankName) {
      return 'Invalid tank name';
    }
  }

  save() {
    this.needsSaving = false;
    const responses: Observable<any>[] = [];
    for (const s of Object.values(this.swimmers)) {
      switch (s.state) {
        case SwimmerState.NEW:
           responses.push(this.tankService.addSwimmer(s.swimmer));
          break;
        case SwimmerState.DELETED:
          responses.push(this.tankService.deleteSwimmer(s.swimmer));
          break;
        case SwimmerState.MODIFIED:
          responses.push(this.tankService.updateSwimmer(s.swimmer));
          break;
      }
    }

    // after changes complete, force the reload of the updated stock by re-selecting it.
    forkJoin(responses).subscribe(_ => this.stockService.selectByIdAndLoad(this.stockId));
    this.router.navigateByUrl('stock_manager/view');
  }

  cancel() {
    this._location.back();
  }

  revert() {
    this.initialize();
  }

  /* To support deactivation check  */
  /* Contrary to tsLint's perspective, this function *is* invoked by the deactivation guard */
  canDeactivate(): boolean | Observable<boolean> |Promise <boolean> {
    if (!this.needsSaving) {
      return true;
    } else {
      return this.deactivationDialogService.confirm('There are unsaved changes to the swimmer you are editing.');
    }
  }

}
