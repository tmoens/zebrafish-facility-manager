import {Component, OnInit} from '@angular/core';
import {AppStateService} from '../../app-state.service';
import {StockService} from '../stock.service';
import {StockFullDto} from '../dto/stock-full-dto';
import {MutationDto} from '../../mutation-manager/mutation-dto';
import {TransgeneDto} from '../../transgene-manager/transgene-dto';
import {Router} from '@angular/router';
import {PrintService} from '../../printing/print.service';
import {TankLabel} from '../../printing/tank-label/tank-label';
import {ZFTool} from '../../helpers/zf-tool';

@Component({
  selector: 'app-tank-label-maker',
  templateUrl: './tank-label-maker.component.html',
  styleUrls: ['./tank-label-maker.component.scss']
})
export class TankLabelMakerComponent implements OnInit {
  stock: StockFullDto;
  label: TankLabel;

  // How about a helping of lame sauce with this menu?
  fonts = ['Roboto', 'Arial', 'Arial Narrow', 'Arial Black', 'Calibri', 'Helvetica', 'PT Sans']

  constructor(
    public appState: AppStateService,
    private stockService: StockService,
    private printService: PrintService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.stock = this.stockService.selected;
    this.label = new TankLabel(this.appState.facilityConfig);
    this.initialize();
  }

  initialize() {
    // Copy data from the stock into the label
    this.label.stockUrl = location.origin + '/stock_manager/view/' + this.stockService.selected.id;
    this.label.name = this.stock.name;
    this.label.fertilizationDate = this.stock.fertilizationDate;
    this.label.description = this.stock.description;
    this.label.mutations = this.stock.mutations.map((m: MutationDto) => m.fullName).join(', ');
    this.label.transgenes = this.stock.transgenes.map((t: TransgeneDto) => t.fullName).join(', ');
    if (this.stock.researcherUser) {
      this.label.researcherName = this.stock.researcherUser.name;
      this.label.researcherInitials = this.stock.researcherUser.initials;
    }
    if (this.stock.piUser) {
      this.label.piName = this.stock.piUser.name;
      this.label.piInitials = this.stock.piUser.initials;
    }
    this.label.additionalNote = null;
  }


  changeFontSize(amount: number) {
    this.label.printConfig.fontPointSize = this.label.printConfig.fontPointSize + amount;
  }

  done() {
    this.router.navigateByUrl(ZFTool.STOCK_MANAGER.route + '/view').then();
  };

  revert() {
    this.initialize();
  };

  print() {
    // We just stick the tank label in the appState before we go to print it.
    // The printer just fetches from there.  This is the easiest way to get the
    // data for the label from here to there.  We could do it through navigation
    // parameters, but that is just a pain in the ass, and since the app state
    // is around anyway - this seems like a good idea.
    this.appState.setState('tankLabel', this.label, false);
    this.printService.printDocument('tankLabel');
  };

}

