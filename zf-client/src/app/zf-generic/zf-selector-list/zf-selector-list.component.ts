import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ZFGenericService} from "../zfgeneric-service";
import {ZfGenericDto} from "../zfgeneric-dto";

// Presents a list of Zf objects in a selectable list.
// The list items show a little bit of detail about the object.

// The non-selectable version is app-zf-detail-list

// Rememory aide. A material-list-option has a bunch of automated behaviors
// If you have *more than 3* mat-lines within a mat-list-option, the size becomes "auto".
// If you have a mat-line directly inside a mat-list-option good luck styling
// it either with <h2> type tags OR with class="whatever".
// On the other hand, if you put the mat-line inside a div, you can go wild with styling.
// So if you think there are arbitrary <divs> below, you now know why.

@Component({
  selector: 'app-zf-selector-list',
  template: `
    <ng-container *ngIf="list.length > 0">
      <mat-selection-list #items dense [multiple]="false"
                          (selectionChange)="selectionChange(items.selectedOptions.selected[0]?.value)">
        <mat-list-option *ngFor="let item of list"
                         [value]="item"
                         [selected]="service.selected?.id === item.id"
                         class="zf-selection-item"
                         [class.selected]="service.selected && service.selected.id === item.id">
          <div mat-line>
            <div class="zf-mini-title" *ngIf="item.title">
              <span *ngIf="item.internalLinkLabel" class="zf-clickable">{{item.internalLinkLabel}}</span>
              {{item.title}}
              <span *ngIf="item.externalLinkURL">
                <a href="{{item.externalLinkURL}}" target="_blank">{{item.externalLinkLabel}}</a>
              </span>
            </div>
          </div>
          <div *ngFor="let detail of item.details">
            <div class="zf-mini-row" mat-line>{{detail}}</div>
          </div>
        </mat-list-option>
      </mat-selection-list>
    </ng-container>
    <ng-container *ngIf="list.length === 0 && emptyMessage">
      <mat-list role="list" dense>
        <mat-list-item>{{emptyMessage}}</mat-list-item>
      </mat-list>
    </ng-container>
  `,
  styleUrls: ['./zf-selector-list.component.scss']
})
export class ZfSelectorListComponent implements OnInit {
  @Input() service: ZFGenericService<any, any, any>;
  @Input() list: ZfGenericDto[];
  @Input() emptyMessage: string;
  @Output() itemSelected = new EventEmitter<ZfGenericDto>();

  constructor() {
  }

  ngOnInit(): void {
  }

  selectionChange(instance: ZfGenericDto | null) {
    this.itemSelected.emit(instance);
  }
}
