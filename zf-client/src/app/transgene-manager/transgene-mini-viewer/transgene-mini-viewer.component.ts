import {Component, Input, OnInit} from '@angular/core';
import {TransgeneDto} from "../transgene-dto";

// This is a summary view of a transgene used in many places - usually in a list of transgenes.
// If the transgene has a "nickname" it is generally used wherever the transgene is referred to.
@Component({
  selector: 'app-transgene-mini-viewer',
  template: `
    <div class="zf-mini-title">{{transgene.fullName}}
      <span *ngIf="transgene.zfinURL">
        <a href="{{transgene.zfinURL}}" target="_blank">ZFIN</a>
      </span>
    </div>
    <div *ngIf="transgene.nickname" class="zf-mini-row truncate">{{transgene.descriptor}}^{{transgene.allele}}</div>
    <div *ngIf="transgene.plasmid" class="zf-mini-row truncate">plasmid: {{transgene.plasmid}}</div>
    <div *ngIf="transgene.comment" class="zf-mini-row truncate">{{transgene.comment}}</div>
  `,
})
export class TransgeneMiniViewerComponent implements OnInit {
  @Input() transgene: TransgeneDto;

  constructor() { }

  ngOnInit(): void {
  }

}
