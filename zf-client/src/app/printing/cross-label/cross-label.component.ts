import {Component, OnInit} from '@angular/core';
import {PrintService} from '../print.service';
import {AppStateService} from '../../app-state.service';
import {CrossLabel} from './cross-label';

@Component({
  selector: 'app-cross-label',
  templateUrl: './cross-label.component.html',
  styleUrls: ['./cross-label.component.scss']
})
export class CrossLabelComponent implements OnInit {
  crossLabel: CrossLabel;

  constructor(
    private appState: AppStateService,
    private printService: PrintService,
  ) {
  }

  ngOnInit(): void {
    // The assumption is that before this gets invoked, the invoker stuffs the data
    // for the label in the appState and now we just go fetch it.  It may be a
    // sub optimal design, but it is really easy.
    this.crossLabel = this.appState.getState('crossLabel');
    console.log(JSON.stringify(this.crossLabel, null, 2));
    this.printService.onDataReady();
  }
}
