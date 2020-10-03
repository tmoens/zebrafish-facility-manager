import {Component, Input, OnInit} from '@angular/core';
import {StockDto} from "../dto/stock-dto";

@Component({
  selector: 'app-stock-mini-viewer',
  template: `
    <div><span class="zf-clickable" >{{stock.name}}</span> {{stock.description}}</div>
    <div *ngIf="stock.alleleSummary" class="zf-mini-row truncate">
      {{stock.alleleSummary}}
    </div>
  `,
})
export class StockMiniViewerComponent implements OnInit {
  @Input() stock: StockDto;

  constructor() { }

  ngOnInit(): void {
  }

}
