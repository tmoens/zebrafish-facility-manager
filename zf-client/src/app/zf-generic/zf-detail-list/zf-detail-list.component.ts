import {Component, Input, OnInit} from '@angular/core';
import {ZfGenericDto} from "../zfgeneric-dto";

// Presents a list of Zf objects in a static (non-selectable) list.
// The list items show some detail about the object.

// The selectable version is app-zf-selector-list


@Component({
  selector: 'app-zf-detail-list',
  template: `
    <ng-container *ngIf="list.length > 0">
      <mat-list dense>
        <mat-list-item *ngFor="let item of list">
          <div mat-line>
            <div class="zf-mini-title" *ngIf="item.title">
              {{item.title}}
              <span *ngIf="item.externalLinkURL">
                <a href="{{item.externalLinkURL}}" target="_blank">{{item.externalLinkLabel}}</a>
              </span>
            </div>
          </div>
          <div mat-line *ngFor="let detail of item.details">
            <div class="zf-mini-row">{{detail}}</div>
          </div>
        </mat-list-item>
      </mat-list>
    </ng-container>
    <ng-container *ngIf="list.length === 0 && emptyMessage">
      <mat-list role="list" dense>
        <mat-list-item>{{emptyMessage}}</mat-list-item>
      </mat-list>
    </ng-container>
  `,
  styleUrls: ['./zf-detail-list.component.scss']
})
export class ZfDetailListComponent implements OnInit {
  @Input() list: ZfGenericDto[];
  @Input() emptyMessage: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
