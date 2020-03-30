import {Component, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {ZFTool} from "../../helpers/zf-tool";

@Component({
  selector: 'app-stock-menu',
  templateUrl: './stock-menu.component.html',
  styleUrls: ['./stock-menu.component.scss']
})

export class StockMenuComponent implements OnInit {

  constructor(
    private router: Router,
    public stockService: StockService,
  ) {
  }

  ngOnInit() {
  }

  onCreateStock(): void {
    this.router.navigate([ZFTool.STOCK_MANAGER.route + '/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }

  onStockReport(): void {
    this.stockService.getStockReport();
  }

  onFacilityAudit(): void {
    this.stockService.getAuditReport();
  }
}


