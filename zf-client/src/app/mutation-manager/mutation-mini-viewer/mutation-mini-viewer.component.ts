import {Component, Input, OnInit} from '@angular/core';
import {MutationDto} from "../mutation-dto";

@Component({
  selector: 'app-mutation-mini-viewer',
  template: `
    <div mat-line *ngIf="mutation.alternateGeneName" class="zf-mini-row">
      alt gene name: {{mutation.alternateGeneName}}
    </div>
    <div mat-line *ngIf="mutation.researcher" class="zf-mini-row">
      plasmid: {{mutation.researcher}}
    </div>
    <div mat-line *ngIf="mutation.phenotype" class="zf-mini-row">
      phenotype: {{mutation.phenotype.substr(0, 50)}}
    </div>
    <div mat-line *ngIf="mutation.morphantPhenotype" class="zf-mini-row">
      morphant phenotype: {{mutation.morphantPhenotype.substr(0, 50)}}
    </div>
    <div mat-line *ngIf="mutation.comment" class="zf-mini-row">
      comment: {{mutation.comment.substr(0, 50)}}
    </div>
  `,
})
export class MutationMiniViewerComponent implements OnInit {
  @Input() mutation: MutationDto;

  constructor() { }

  ngOnInit(): void {
  }

}
