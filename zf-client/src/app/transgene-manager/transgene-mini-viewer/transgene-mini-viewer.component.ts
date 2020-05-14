import {Component, Input, OnInit} from '@angular/core';
import {TransgeneDto} from "../transgene-dto";

@Component({
  selector: 'app-transgene-mini-viewer',
  template: `
    <div mat-line *ngIf="transgene.source" class="zf-mini-row">source: {{transgene.source}}</div>
    <div mat-line *ngIf="transgene.plasmid" class="zf-mini-row">plasmid: {{transgene.plasmid}}</div>
    <div mat-line *ngIf="transgene.comment" class="zf-mini-row">comment: {{transgene.comment.substr(0, 50)}}</div>
  `,
})
export class TransgeneMiniViewerComponent implements OnInit {
  @Input() transgene: TransgeneDto;

  constructor() { }

  ngOnInit(): void {
  }

}
