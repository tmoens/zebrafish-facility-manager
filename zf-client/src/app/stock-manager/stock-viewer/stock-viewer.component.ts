import {Component, OnInit} from '@angular/core';
import {StockService} from '../stock.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {EditMode} from '../../zf-generic/zf-edit-modes';
import {AppStateService, ZFToolStates} from "../../app-state.service";
import {ZfGenericDto} from "../../zf-generic/zfgeneric-dto";
import {ScreenSizes} from "../../helpers/screen-sizes";
import {ZFTypes} from "../../helpers/zf-types";

@Component({
  selector: 'app-stock-viewer',
  templateUrl: './stock-viewer.component.html',
  styleUrls: ['./stock-viewer.component.scss']
})

export class StockViewerComponent implements OnInit {
  ScreenSizes = ScreenSizes;
  id: number = null;
  highlightStock: number;
  highlightMutation: number;
  highlightTransgene: number;

  constructor(
    public appState: AppStateService,
    private router: Router,
    private route: ActivatedRoute,
    public service: StockService,
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
        // if there is no id in the route, see if a stock is already in the app-state
        // (e.g. on restart) and if so, navigate to it.
        const storedId = this.appState.getToolState(ZFTypes.STOCK, ZFToolStates.SELECTED_ID);
        if (storedId) {
          this.router.navigateByUrl('stock_manager/view/' + storedId, {replaceUrl: true}).then();
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
}
