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
    this.researcherId = this.authService.loggedInUserId();
    this.crossLabel.dateString = this.date.toISOString().substr(0, 10);
    if (this.service.selected) {
      this.crossLabel.momName = this.service.selected.name;
      this.onSetMatStock();
    }
    this.authApiService.getUsersByType('ACTIVE_RESEARCHER')
      .subscribe((data: UserDTO[]) => {
        this.researchers = data;
        this.onSelectResearcher();
      });
    this.labelHeight = this.appState.getState('tankLabelHeight');
    this.labelWidth = this.appState.getState('tankLabelWidth');
    this.crossLabel.fontSize = this.appState.getState('tankLabelPointSize');
    this.crossLabel.fontFamily = this.appState.getState('tankLabelFontFamily');
  }

  onSelectResearcher() {
    this.crossLabel.researcherName = '';
    this.researchers.map((r: UserDTO) => {
      if (r.id === this.researcherId) {
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
    // We just stick the cross label in the appState before we go to print it.
    // The printer just fetches from there.  This is the easiest way to get the
    // data for the label from her to there.  We could do it through navigation
    // parameters, but that is just a pain in the ass, and since the app state
    // is around anyway - this seems like a good idea.
    this.appState.setState('crossLabel', this.crossLabel, false);
    this.printService.printDocument('crossLabel');
  };
}

// A cross label is just a bunch of data that describes a cross between
// two stocks and a bit of ancillary data like which researcher is doing the work.
// The data for a cross label is totally transient.  It is never stored in the
// the database.  It is basically an aide for people with bad handwriting to put
// a whole bunch of text on a small label in a consistent and legible way.
export class CrossLabel {
  researcherName: string;
  momName: string = null;
  dadName: string = null;
  momTank: string;
  dadTank: string;
  momLabelDescription: string = '';
  dadLabelDescription: string = '';
  dateString: string;
  note: string = '';
  fontFamily: number;
  fontSize: number;
}
