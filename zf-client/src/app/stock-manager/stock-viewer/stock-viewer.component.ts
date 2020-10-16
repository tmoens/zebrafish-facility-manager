import {Component, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {MutationService} from '../../mutation-manager/mutation.service';
import {TransgeneService} from '../../transgene-manager/transgene.service';
import {PrintService} from '../../printing/print.service';
import {AppStateService} from "../../app-state.service";
import {ZfGenericDto} from "../../zf-generic/zfgeneric-dto";

/**
 * Note to future self.
 * Why do we not simply view the selected stock in the service?
 * Because we want to navigate to each selected stock explicitly.  And we want
 * to do that because it gives us free forward/backward navigation in the browser.
 */
@Component({
  selector: 'app-stock-viewer',
  templateUrl: './stock-viewer.component.html',
  styleUrls: ['./stock-viewer.component.scss']
})

export class StockViewerComponent implements OnInit {
  id: number = null;
  highlightStock: number;
  highlightMutation: number;
  highlightTransgene: number;

  constructor(
    public appState: AppStateService,
    private router: Router,
    private route: ActivatedRoute,
    public service: StockService,
    private mutationService: MutationService,
    private transgeneService: TransgeneService,
    private printService: PrintService,
  ) {
    this.service.enterBrowseMode();
  }

  ngOnInit() {
    // We have to do a little mucky maulers here to ensure that the stock we
    // were asked to view is the same as the "selected" stock in stock service
    // and vice versa.

    // use the route's paramMap to figure out the id of the item we are supposed to view.
    this.route.paramMap.subscribe((pm: ParamMap) => {
      // if there is an id in the route, tell the service to select it.
      const id = +pm.get('id');
      if (id) {
        this.service.selectByIdAndLoad(id);
      } else {
        // if there is no id in the route, see if a stock is already selected and if so, navigate to it.
        if (this.service.selected) {
          this.router.navigateByUrl('stock_manager/view/' + this.service.selected.id, {replaceUrl: true}).then();
        } else {
          // we were not given an id to view and there is no "selected" id, final try is to
          // navigate to the first iem in the list...
          const firstId = this.service.getFirstFiltered();
          if (firstId) {
            this.router.navigateByUrl('stock_manager/view/' + firstId, {replaceUrl: true}).then();
          }
        }
      }
    });
  }

  goTo(id: number) {
    this.router.navigate(['stock_manager/view/' + id]).then();
  }

  goToStock(instance: ZfGenericDto | null) {
    if (instance) {
      this.router.navigate(['stock_manager/view/' + instance.id]).then();
    }
  }

  editStock() {
    this.router.navigate(['stock_manager/' + EditMode.EDIT, {
      id: this.service.selected.id,
      mode: EditMode.EDIT,
    }]).then();
  }

  editMutations() {
    this.router.navigate(['stock_manager/edit/genetics/' + this.service.selected.id]).then();
  }

  editTransgenes() {
    this.router.navigate(['stock_manager/edit/genetics/' + this.service.selected.id]).then();
  }

  editSwimmers() {
    this.router.navigate(['stock_manager/' + EditMode.EDIT + '/swimmers/' + this.service.selected.id]).then();
  }

  /* print a tank label for this tank */
  printLabel(tankId) {
    // this.router.navigateByUrl('preview/tankLabels/' + tankId)
    this.printService.printDocument('tankLabels', [tankId]);

  }
}
