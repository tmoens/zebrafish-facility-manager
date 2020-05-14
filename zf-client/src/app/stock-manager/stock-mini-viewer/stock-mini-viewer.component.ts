import {Component, Input, OnInit} from '@angular/core';
import {StockDto} from "../dto/stock-dto";

@Component({
  selector: 'app-stock-mini-viewer',
  template: `
    <div mat-line *ngIf="stock.researcher" class="zf-mini-row">
      researcher: {{stock.researcher}}
    </div>
    <div mat-line *ngIf="stock.fertilizationDate" class="zf-mini-row">
      birthday: {{stock.fertilizationDate}}
    </div>
    <div mat-line *ngIf="stock.comment" class="zf-mini-row">
      comment: {{stock.comment.substr(0, 50)}}
    </div>
  `,
})
export class StockMiniViewerComponent implements OnInit {
  @Input() stock: StockDto;

  constructor() { }

  ngOnInit(): void {
  }

}
