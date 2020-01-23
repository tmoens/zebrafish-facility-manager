import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StockManagerComponent} from './stock-manager.component';
import {StockViewerComponent} from './stock-viewer/stock-viewer.component';
import {StockEditorComponent} from './stock-editor/stock-editor.component';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {StockSwimmersEditorComponent} from './stock-swimmers-editor/stock-swimmers-editor.component';
import {CanDeactivateGuard} from '../deactivation-guard/can-deactivate-guard';
import {AuthGuard} from "../auth/auth.guard";

const stockManagerRoutes: Routes = [
  {
    path: 'stock_manager',
    component: StockManagerComponent,
    canActivate: [ AuthGuard ],
    children: [
      {
        path: '',
        component: StockViewerComponent,
        canActivate: [ AuthGuard],
      },
      {
        path: 'view',
        component: StockViewerComponent,
        canActivate: [ AuthGuard ],
      },
      {
        path: 'view/:id',
        component: StockViewerComponent,
        canActivate: [ AuthGuard ],
      },
      {
        path: EditMode.CREATE_NEXT,
        component: StockEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.CREATE_SUB_STOCK,
        component: StockEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT + '/swimmers',
        component: StockSwimmersEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT + '/swimmers/:id',
        component: StockSwimmersEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT,
        component: StockEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT + '/:id',
        component: StockEditorComponent,
        canActivate: [ AuthGuard ],
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
