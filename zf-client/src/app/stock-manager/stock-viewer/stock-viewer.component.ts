import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {StockService} from '../stock.service';
import {StockGeneticsEditorComponent} from '../stock-genetics-editor/stock-genetics-editor.component';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {StockFull} from '../stockFull';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {ZFTypes} from '../../loader.service';
import {MutationService} from '../../mutation-manager/mutation.service';
import {TransgeneService} from '../../transgene-manager/transgene.service';
import {PrintService} from '../../printing/print.service';

/**
 * Note to future self.
 * Why do we not simply view the selected selected in the service?
 * Because we want to navigate to each selected selected explicitly.  And we want
 * to do that because it gives us free forward/backward navigation in the browser.
 */
@Component({
  selector: 'app-stock-viewer',
  templateUrl: './stock-viewer.component.html',
  styleUrls: ['./stock-viewer.component.scss']
})

export class StockViewerComponent implements OnInit {
  id: number = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public service: StockService,
    private mutationService: MutationService,
    private transgeneService: TransgeneService,
    private printService: PrintService,
    private readonly subEditor: MatDialog,
  ) {
  }

  ngOnInit() {
    // We have to do a little mucky maulers here to ensure that the selected we
    // were asked to view is the same as the "selected" stock in stock service
    // and vice versa.

    // use the route's paramMap to figure out the id of the item we are supposed to view.
    // Select it.
    // Then let nature take it's course.  We will notice when it becomes selected and
    // then we populate the form with the data from the selected item.
    this.route.paramMap.subscribe((pm: ParamMap) => {
      const id = +pm.get('id');
      if (id && (!this.service.selected || id !== this.service.selected.id)) {
        this.service.selectById(id);
      }
    });
  }

  goTo(id: number) {
    this.router.navigate(['stock_manager/view/' + id]);
  }

  create(): void {
    this.router.navigate(['stock_manager/' + EditMode.CREATE_NEXT, {
      mode: EditMode.CREATE_NEXT,
    }]);
  }

  createSubStock() {
    this.router.navigate(['stock_manager/' + EditMode.CREATE_SUB_STOCK, {
      mode: EditMode.CREATE_SUB_STOCK,
    }]);
  }

  edit(): void {
    this.router.navigate(['stock_manager/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]);
  }

  delete() {
    this.service.delete(this.service.selected.id);
  }

  editMutations() {
      const dialogRef = this.subEditor.open(StockGeneticsEditorComponent, {
        data: {
          type: ZFTypes.MUTATION,
          stock: this.service.selected,
          parentalList: this.service.getParentalMutations(),
          fullList: this.mutationService.all,
          ownList: this.service.selected.mutations,
        }
      });

      dialogRef.afterClosed().subscribe((result: StockFull) => {
        if (result) {
          this.service.selectById(result.id);
        }
      });
  }


  editTransgenes() {
    // this.service.getParentalTransgenes().subscribe((parentalTransgenes: Transgene[]) => {
      const dialogRef = this.subEditor.open(StockGeneticsEditorComponent, {
        data: {
          type: ZFTypes.TRANSGENE,
          stock: this.service.selected,
          parentalList: this.service.getParentalTransgenes(),
          fullList: this.transgeneService.all,
          ownList: this.service.selected.transgenes,
        }
      });

      dialogRef.afterClosed().subscribe((result: StockFull) => {
        if (result) {
          this.service.selectById(result.id);
        }
      });
    // });
  }

  editSwimmers() {
    this.router.navigate(['stock_manager/' + EditMode.EDIT + '/swimmers/' + this.service.selected.id]);
  }

  /* print a tank label for this tank */
  printLabel(tankId) {
    this.printService.printDocument('tankLabels', [tankId]);
  }

  /* print labels for all the tanks this stock is in */
  printLabels() {
    if (this.service.selected.swimmers && this.service.selected.swimmers.length > 0) {
      const tanks = this.service.selected.swimmers.map( swimmer => String(swimmer.tankId) );
      this.printService.printDocument('tankLabels', tanks);
    }
  }
}
