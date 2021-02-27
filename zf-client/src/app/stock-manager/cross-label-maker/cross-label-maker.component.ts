import {Component, OnInit} from '@angular/core';
import {UserDTO} from '../../auth/UserDTO';
import {AuthApiService} from '../../auth/auth-api.service';
import {AppStateService} from '../../app-state.service';
import {StockDto} from '../dto/stock-dto';
import {StockService} from '../stock.service';
import {AuthService} from '../../auth/auth.service';
import {Router} from '@angular/router';
import {PrintService} from '../../printing/print.service';
import {StockFullDto} from '../dto/stock-full-dto';
import {CrossLabel} from '../../printing/cross-label/cross-label';

@Component({
  selector: 'app-cross-label-maker',
  templateUrl: './cross-label-maker.component.html',
  styleUrls: ['./cross-label-maker.component.scss']
})
export class CrossLabelMakerComponent implements OnInit {
  crossLabel: CrossLabel = new CrossLabel();
  researchers: UserDTO[];
  researcherId: string;
  mom: StockDto;
  dad: StockDto;
  momFull: StockFullDto;
  dadFull: StockFullDto;
  date: Date = new Date();
  labelHeight: number;
  labelWidth: number;

  fonts = ['Roboto', 'Arial', 'Arial Narrow', 'Arial Black', 'Calibri', 'Helvetica', 'PT Sans']

  constructor(
    private appState: AppStateService,
    private authService: AuthService,
    private authApiService: AuthApiService,
    private service: StockService,
    private printService: PrintService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    // The default researcher is the one who is logged in.
    this.researcherId = this.authService.loggedInUserId();

    // Get a list of active researchers to populate researcher selection menu
    this.authApiService.getUsersByType('ACTIVE_RESEARCHER')
      .subscribe((data: UserDTO[]) => {
        this.researchers = data;
        this.onSelectResearcher(this.researcherId);
      });

    // The default date is today
    this.crossLabel.dateString = this.date.toISOString().substr(0, 10);

    // by default, the stock last viewed is the mom of the cross. This is just a guess
    // and the user can change it easily.  Someone will complain that I guessed wrong.
    if (this.service.selected) {
      this.crossLabel.momName = this.service.selected.name;
      this.onSetMatStock();
    }

    // For making a mock-up of the label, go look up the facility default label size
    // This *does not* get passed to the tank label printing component because over there it will
    // use the label printer's *actual* label size, which, with luck, will match the defaults.
    this.labelHeight = this.appState.facilityConfig.labelPrintingDefaults.heightInInches;
    this.labelWidth = this.appState.facilityConfig.labelPrintingDefaults.widthInInches;

    // Go get the default font and font size.  The user is allowed to muck around with this
    // a bit so it *does* get sent along to the tank label printing component as part of the label.
    this.crossLabel.fontSize = this.appState.facilityConfig.labelPrintingDefaults.fontPointSize;
    this.crossLabel.fontFamily = this.appState.facilityConfig.labelPrintingDefaults.fontFamily;
  }

  onSelectResearcher(researcherId: string) {
    this.crossLabel.researcherName = '';
    this.researchers.map((r: UserDTO) => {
      if (r.id === researcherId) {
        this.crossLabel.researcherName = r.name;
      }
    })
  }

  onSetMatStock() {
    this.service.getByName(this.crossLabel.momName).subscribe((s: StockDto) => {
      if (s && s.id) {
        this.mom = s;
        this.crossLabel.momLabelDescription = this.mom.description;
        // Because we need to know the tanks the stock lives in, we need to go get the "full" stock
        this.service.getById(this.mom.id).subscribe((sf: StockFullDto) => {
          this.momFull = sf;
          if (this.momFull.swimmers.length > 0) {
            this.crossLabel.momTank = this.momFull.swimmers[0].tank.name;
          }
        })
      } else {
        this.mom = null;
        this.momFull = null;
        this.crossLabel.momTank = null;
        this.crossLabel.momLabelDescription = '';
      }
    });
  }

  onSetPatStock() {
    this.service.getByName(this.crossLabel.dadName).subscribe((s: StockDto) => {
      if (s && s.id) {
        this.dad = s;
        this.crossLabel.dadLabelDescription = this.dad.description;
        // Because we need to know the tanks the stock lives in, we need to go get the "full" stock
        this.service.getById(this.dad.id).subscribe((sf: StockFullDto) => {
          this.dadFull = sf;
          if (this.dadFull.swimmers.length > 0) {
            this.crossLabel.dadTank = this.dadFull.swimmers[0].tank.name;
          }
        })
      } else {
        this.dad = null;
        this.dadFull = null;
        this.crossLabel.dadTank = null;
        this.crossLabel.dadLabelDescription = '';
      }
    });
  }

  changeFontSize(amount: number) {
    this.crossLabel.fontSize = this.crossLabel.fontSize + amount;
  }

  isValid(): boolean {
    return true;
  };

  done() {
    this.router.navigateByUrl('stock_manager/view').then();
  };

  print() {
    // We just stick the crossLabel in the appState before we go to print it.
    // The printer just fetches from there.  This is the easiest way to get the
    // data for the label from here to there.  We could do it through navigation
    // parameters, but that is just a pain in the ass, and since the app state
    // is around anyway - this seems like a good idea.
    this.appState.setState('crossLabel', this.crossLabel, false);
    this.printService.printDocument('crossLabel');
  };
}
