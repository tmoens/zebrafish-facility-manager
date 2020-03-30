import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StockManagerComponent} from './stock-manager.component';
import {StockViewerComponent} from './stock-viewer/stock-viewer.component';
import {StockEditorComponent} from './stock-editor/stock-editor.component';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {StockSwimmersEditorComponent} from './stock-swimmers-editor/stock-swimmers-editor.component';
import {CanDeactivateGuard} from '../deactivation-guard/can-deactivate-guard';
import {LoginGuardService as LoginGuard} from "../auth/login-guard.service";

const stockManagerRoutes: Routes = [
  {
    path: 'stock_manager',
    component: StockManagerComponent,
    children: [
      {
        path: '',
        component: StockViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'view',
        component: StockViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'view/:id',
        component: StockViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.CREATE_NEXT,
        component: StockEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.CREATE_SUB_STOCK,
        component: StockEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.EDIT + '/swimmers',
        component: StockSwimmersEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.EDIT + '/swimmers/:id',
        component: StockSwimmersEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.EDIT,
        component: StockEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.EDIT + '/:id',
        component: StockEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
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
