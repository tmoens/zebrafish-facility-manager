import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PrintService} from '../print.service';
import {AppStateService} from '../../app-state.service';
import {TankLabelOption} from './tank-label';
import {StockService} from '../../stock-manager/stock.service';

export class TankLabel {
  qrCode
  rows: string[][] = [];
  addRow(row: string[]) {
    this.rows.push(row);
  }
}


export class TankLabels {
  height: number;
  width: number;
  fontPointSize: number;
  labels: TankLabel[] = [];

  addLabel(l: TankLabel) {
    this.labels.push(l);
  }
}



@Component({
  selector: 'app-tank-label',
  templateUrl: './tank-label.component.html',
  styleUrls: ['./tank-label.component.scss']
})
export class TankLabelComponent implements OnInit {
  tankIds: string[];
  tankLabels: TankLabels = new TankLabels();
  stockUrl: string;

  constructor(
    route: ActivatedRoute,
    private stockService: StockService,
    private printService: PrintService,
    public appState: AppStateService,
  ) {
    this.tankIds = route.snapshot.params['tankIds']
      .split(',');
  }

  ngOnInit() {

    this.tankLabels.fontPointSize =
      this.appState.getState('tankLabelPointSize');
    for (const tankId of this.tankIds) {
      this.tankLabels.addLabel(this.makeLabel(tankId));
    }
    console.log(JSON.stringify(this.tankLabels));
    this.printService.onDataReady();

    // We are going to make a QR code from this so that users can see all the
    // stock details by pointing their camera at said code on a label
    this.stockUrl = location.origin + '/stock_manager/view/' + this.stockService.selected.id;


  }

  makeLabel(tankId: string): TankLabel {
    const label = new TankLabel();
    for (const row of this.appState.getState('tankLabelLayout')) {
      const labelRow = [];
      for (const field of row) {
        switch (field) {
          case TankLabelOption.STOCK_DESCRIPTION:
            labelRow.push(this.stockService.selected.description);
            break;
          case TankLabelOption.STOCK_FERTILIZATION_DATE:
            labelRow.push(this.stockService.selected.fertilizationDate);
            break;
          case TankLabelOption.STOCK_RESEARCHER:
            if (this.stockService.selected.researcher) {
              labelRow.push(this.stockService.selected.researcher);
            }
            break;
          case TankLabelOption.STOCK_RESEARCHER_INITIALS:
            if (this.stockService.selected.researcher) {
              labelRow.push(acronize(this.stockService.selected.researcher));
            }
            break;
          case TankLabelOption.STOCK_PI_INITIALS:
            if (this.stockService.selected.pi) {
              labelRow.push(acronize(this.stockService.selected.pi));
            }
            break;
          case TankLabelOption.STOCK_PI:
            if (this.stockService.selected.pi) {
              labelRow.push(this.stockService.selected.pi);
            }
            break;
          case TankLabelOption.STOCK_NUMBER:
            labelRow.push(this.stockService.selected.name);
            break;
          case TankLabelOption.STOCK_MUTATIONS:
            for (const m of this.stockService.selected.mutations) {
              labelRow.push(m.fullName);
            }
            break;
          case TankLabelOption.STOCK_TRANSGENES:

            labelRow.push(this.stockService.selected.transgenes
              .map(t => t.fullName)
              .join(', ')
            );
            break;
          case TankLabelOption.TANK_NUMBER:
            labelRow.push('oopsy');
            break;
          default:
            labelRow.push(field);
            break;

        }
      }
      label.addRow(labelRow);
    }
    return label;
  }
}

/* make an acronym from a set of words. Used here to create initials from a name */
function acronize(s: string): string {
  if (!s) { return null; }
  return s
    .split(/\s/)
    .reduce((response, word) => response += word.slice(0, 1), '');
}


