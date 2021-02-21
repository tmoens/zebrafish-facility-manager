import {Component, OnInit} from '@angular/core';
import {PrintService} from '../print.service';
import {AppStateService} from '../../app-state.service';
import {TankLabel} from './tank-label';


@Component({
  selector: 'app-tank-label',
  templateUrl: './tank-label.component.html',
  styleUrls: ['./tank-label.component.scss']
})
export class TankLabelComponent implements OnInit {
  stockUrl: string;
  label: TankLabel;

  constructor(
    public appState: AppStateService,
    private printService: PrintService,
  ) {
  }

  ngOnInit() {

    // The assumption is that before this gets invoked, the invoker stuffs the data
    // for the label in the appState and now we just go fetch it.  It may be a
    // sub optimal design, but it is really easy.
    this.label = this.appState.getState('tankLabel');
    console.log(JSON.stringify(this.label, null, 2));
    this.printService.onDataReady();
  }
}
