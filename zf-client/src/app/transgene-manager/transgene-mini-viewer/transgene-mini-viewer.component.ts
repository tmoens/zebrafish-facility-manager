import {Component, Input, OnInit} from '@angular/core';
import {TransgeneDto} from "../transgene-dto";

@Component({
  selector: 'app-transgene-mini-viewer',
  template: `
    <div mat-line *ngIf="transgene.source" class="zf-mini-row truncate">
      source: {{transgene.source}}
    </div>
    <div mat-line *ngIf="transgene.plasmid" class="zf-mini-row truncate">
      plasmid: {{transgene.plasmid}}
    </div>
    <div mat-line *ngIf="transgene.comment" class="zf-mini-row truncate">
      comment: {{transgene.comment}}
    </div>
  `,
})
export class TransgeneMiniViewerComponent implements OnInit {
  @Input() transgene: TransgeneDto;

  constructor() { }

  ngOnInit(): void {
  }

}
