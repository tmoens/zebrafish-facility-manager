import {Component, Input, OnInit} from '@angular/core';
import {MutationDto} from "../mutation-dto";

@Component({
  selector: 'app-mutation-tiny-viewer',
  template: `
    <div class="zf-mini-title">{{mutation.fullName}}</div>
    <div *ngIf="mutation.phenotype" class="zf-mini-row truncate">phenotype: {{mutation.phenotype}}</div>
    <div *ngIf="mutation.comment" class="zf-mini-row truncate">{{mutation.comment}}</div>
  `,
})
export class MutationTinyViewerComponent implements OnInit {
  @Input() mutation: MutationDto;

  constructor() {
  }

  ngOnInit(): void {
  }

}
