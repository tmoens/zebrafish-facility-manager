import {Component, OnInit} from '@angular/core';
import {TankDto} from '../common/tank.dto';
import {TankNeighborsDto} from '../common/tankNeighborsDto';
import {SwimmerFullDto} from '../common/swimmer-full.dto';
import {FormBuilder} from '@angular/forms';
import {StockService} from '../stock-manager/stock.service';
import {TankService} from '../tank-manager/tank.service';
import {LoaderService} from '../loader.service';
import {AppStateService} from '../app-state.service';
import {SwimmerDto} from '../common/swimmer.dto';
import {AuthService} from '../auth/auth.service';
import {ZFTool} from '../helpers/zf-tool';

// Navigate tank by tank through a facility
// Allow the user, on a phone, looking at a particular physical tank, to correct
// the system's view of what stocks are in the tank (swimmers).

// Scenario 1: user looks at tank T17 which is clearly labeled with
// stock S1564.02.  But the app thinks the tank is empty.
// Allow the user to add S1564.02 to the tank along with a fish count.

// Scenario 2: user looks at a clearly empty tank T18, but the app thinks
// it contains stock S1564.02.
// Allow the user to remove stock S1564.02 from the tank.

// Scenario 3: user looks at tanks T18 which is clearly labeled with
// stock S1442 and has about 9 fish in it.  The app agrees that S1442 is
// in the tank but there are 23 fish present.
// Allow the user to correct the count.

// All of this has to come with support for multiple stocks in a single
// tank - as this does in fact happen on occasion.

// Somehow we have to deal with "virtual" tanks like "Nursery" where there
// can be many many stocks and the audit is not rational for those tanks.

// Guiding philosophy - this has to be super efficient in terms of screen
// touches because there can be thousands of tanks in a facility so it
// has to be super easy to:
// - achieve the three main functions listed above
// - navigate to the next tank (or the previous)
// - jump to any tank in the facility and get going from there
// - pick up where you last left off
// - stop the audit at any time and place

const AUDITING_TANK_REMEMORY = 'AUDITING_TANK_REMEMORY';

@Component({
  selector: 'app-facility-auditor',
  templateUrl: './facility-audit.component.html',
  styleUrls: ['./facility-audit.component.scss']
})


export class FacilityAuditComponent implements OnInit {
  // The tank the user is busy auditing
  currentTank: TankDto;

  // The tanks before and after the current tank
  neighbors: TankNeighborsDto;

  // The stocks currently inhabiting the current tank
  currentSwimmers: SwimmerFullDto[] = [];

  tankJumpForm = this.fb.group( {
    tankName: [''],
  });

  get tankNameFC() {
    return this.tankJumpForm.get('tankName');
  }
  tankHint = '';

  // The tank whose name the user has entered in the "jumpTank" form
  jumpTank: TankDto;

  constructor(
    private fb: FormBuilder,
    public service: StockService,
    public tankService: TankService,
    public loader: LoaderService,
    public appState: AppStateService,
    public authService: AuthService,
  ) {
    this.appState.setActiveTool(ZFTool.FACILITY_AUDIT);
  }

  ngOnInit(): void {
    const startingTank: TankDto = this.appState.getState(AUDITING_TANK_REMEMORY);
    if (startingTank) {
      this.navigateTo(startingTank)
    } else {
      this.loader.getFirstTank().subscribe((tank: TankDto) => {
        if (tank) {
          this.navigateTo(tank);
        }
      })
    }
    this.tankNameFC.valueChanges.subscribe(value => this.onTankNameChange(value));
  }

  navigateTo(tank: TankDto) {
    this.currentTank = tank;
    this.appState.setState(AUDITING_TANK_REMEMORY, tank);
    this.getStocksInCurrentTank();
    this.getNeighborsOfCurrentTank();
    this.tankNameFC.setValue('');
  }

  getStocksInCurrentTank() {
    if (this.currentTank) {
      this.loader.getStocksInTank(this.currentTank.id).subscribe(swimmers => {
        this.currentSwimmers = swimmers;
        const swimmerToBeAdded: SwimmerFullDto = new SwimmerFullDto();
        swimmerToBeAdded.tank = this.currentTank;
        swimmerToBeAdded.tankId = this.currentTank.id;
        swimmerToBeAdded.number = 1;
        this.currentSwimmers.push(swimmerToBeAdded);
      });
    }
  }

  getNeighborsOfCurrentTank() {
    if (this.currentTank) {
      this.loader.getTankNeighbors(this.currentTank).subscribe((neighbors: TankNeighborsDto) => {
        this.neighbors = neighbors;
      })
    }
  }

  previousTank() {
    if (this.neighbors && this.neighbors.previous) this.navigateTo(this.neighbors.previous);
  }

  nextTank() {
    if (this.neighbors && this.neighbors.next) this.navigateTo(this.neighbors.next);
  }

  jumpToTank() {
    this.navigateTo(this.jumpTank);
  }

  // Handle the events when the swimmer-editor emits a change event
  onStockChange(originalSwimmer: SwimmerDto, newSwimmer: SwimmerDto) {

    // Case 1: this is a new stock, just add it.
    if (!originalSwimmer.stockId) {
      this.tankService.addSwimmer(newSwimmer).subscribe(_ => {
        this.getStocksInCurrentTank();
      });
      return;
    }

    // Case 2: the stock changed. This seems logically bizarre because you
    // can't really *change* a stock in a tank.  It is really just a shortcut
    // for saying delete the one that was in the tank and add this new one.
    this.tankService.deleteSwimmer(originalSwimmer).subscribe(_ => {
      this.tankService.addSwimmer(newSwimmer).subscribe(_ => {
        this.getStocksInCurrentTank();
      })
    })
  }

  onDelete(swimmer: SwimmerFullDto) {
    this.tankService.deleteSwimmer(swimmer).subscribe(_ => {
      this.getStocksInCurrentTank();
    });
  }

  onTankNameChange(name: string) {
    this.jumpTank = this.tankService.getTankByName(name);
    if (this.jumpTank) {
      this.tankHint = 'Known tank';
    } else {
      this.tankHint = 'Enter any tank to jump to';
    }
  }
}
