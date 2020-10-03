import {Component, Input, OnInit} from '@angular/core';
import {TransgeneDto} from "../transgene-dto";

@Component({
  selector: 'app-transgene-mini-viewer',
  template: `
    <div class="zf-mini-title">{{transgene.fullName}}</div>
    <div *ngIf="transgene.nickname" class="zf-mini-row truncate">{{transgene.descriptor}}^{{transgene.allele}}</div>
    <div *ngIf="transgene.plasmid" class="zf-mini-row truncate">plasmid: {{transgene.plasmid}}</div>
    <div *ngIf="transgene.comment" class="zf-mini-row truncate">comment: {{transgene.comment}}</div>
  `,
})
export class TransgeneMiniViewerComponent implements OnInit {
  @Input() transgene: TransgeneDto;

  constructor() { }

  ngOnInit(): void {
  }

}
