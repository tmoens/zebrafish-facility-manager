import {Component, Input, OnInit} from '@angular/core';
import {MutationDto} from "../mutation-dto";

@Component({
  selector: 'app-mutation-mini-viewer',
  template: `
    <div mat-line *ngIf="mutation.alternateGeneName" class="zf-mini-row truncate">
      alt gene name: {{mutation.alternateGeneName}}
    </div>
    <div mat-line *ngIf="mutation.phenotype" class="zf-mini-row truncate">
      phenotype: {{mutation.phenotype}}
    </div>
    <div mat-line *ngIf="mutation.comment" class="zf-mini-row truncate">
      comment: {{mutation.comment}}
    </div>
  `,
})
export class MutationMiniViewerComponent implements OnInit {
  @Input() mutation: MutationDto;

  constructor() { }

  ngOnInit(): void {
  }

}