import {Component, Input, OnInit} from '@angular/core';
import {TransgeneDto} from "../transgene-dto";

// This is view of a transgene with a little extra info.
@Component({
  selector: 'app-transgene-tiny-viewer',
  template: `
    <div class="zf-mini-title">{{transgene.fullName}}</div>
    <div *ngIf="transgene.plasmid" class="zf-mini-row truncate">plasmid: {{transgene.plasmid}}</div>
    <div *ngIf="transgene.comment" class="zf-mini-row truncate">comment: {{transgene.comment}}</div>
  `,
})
export class TransgeneTinyViewerComponent implements OnInit {
  @Input() transgene: TransgeneDto;

  constructor() {
  }

  ngOnInit(): void {
  }

}
