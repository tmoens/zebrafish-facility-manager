import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StockManagerComponent} from './stock-manager.component';
import {StockViewerComponent} from './stock-viewer/stock-viewer.component';
import {StockEditorComponent} from './stock-editor/stock-editor.component';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {StockSwimmersEditorComponent} from './stock-swimmers-editor/stock-swimmers-editor.component';
import {CanDeactivateGuard} from '../deactivation-guard/can-deactivate-guard';

const stockManagerRoutes: Routes = [
  {
    path: 'stock_manager',
    component: StockManagerComponent,
    children: [
      {
        path: '',
        component: StockViewerComponent,
      },
      {
        path: 'view',
        component: StockViewerComponent,
      },
      {
        path: 'view/:id',
        component: StockViewerComponent,
      },
      {
        path: EditMode.CREATE_NEXT,
        component: StockEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.CREATE_SUB_STOCK,
        component: StockEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT + '/swimmers',
        component: StockSwimmersEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT + '/swimmers/:id',
        component: StockSwimmersEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT,
        component: StockEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT + '/:id',
        component: StockEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(stockManagerRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class StockManagerRoutingModule { }
