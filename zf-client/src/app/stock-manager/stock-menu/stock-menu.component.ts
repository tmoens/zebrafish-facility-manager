import {Component, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {ZFTool} from "../../helpers/zf-tool";
import {PrintService} from "../../printing/print.service";

@Component({
  selector: 'app-stock-menu',
  templateUrl: './stock-menu.component.html',
  styleUrls: ['./stock-menu.component.scss']
})

export class StockMenuComponent implements OnInit {

  constructor(
    private router: Router,
    public service: StockService,
    private printService: PrintService,
  ) {
  }

  ngOnInit() {
  }

  onCreate(): void {
    this.router.navigate([ZFTool.STOCK_MANAGER.route + '/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }

  createSubStock() {
    this.router.navigate(['stock_manager/' + EditMode.CREATE_SUB_STOCK, {
      mode: EditMode.CREATE_SUB_STOCK,
    }]);
  }

  onEdit(): void {
    this.router.navigate(['stock_manager/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

  onDelete() {
    this.service.delete(this.service.selected.id);
  }

  /* print labels for all the tanks this stock is in */
  printLabels() {
    if (this.service.selected.swimmers && this.service.selected.swimmers.length > 0) {
      const tanks = this.service.selected.swimmers.map( swimmer => String(swimmer.tankId) );
      this.printService.printDocument('tankLabels', tanks);
    }
  }

  goToTankWalker(){
    this.router.navigateByUrl('stock_manager/stock_walker');
  }

  onStockReport(): void {
    this.service.getStockReport();
  }

  onFacilityAudit(): void {
    this.service.getAuditReport();
  }

  goToBestPractices(): void {
    window.open('https://zebrafishfacilitymanager.com/stocks');
  }
}


