import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StockManagerComponent} from './stock-manager.component';
import {StockViewerComponent} from './stock-viewer/stock-viewer.component';
import {StockEditorComponent} from './stock-editor/stock-editor.component';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {StockSwimmersEditorComponent} from './stock-swimmers-editor/stock-swimmers-editor.component';
import {CanDeactivateGuard} from '../guards/can-deactivate-guard';
import {LoginGuardService as LoginGuard} from "../auth/guards/login-guard.service";
import {RoleGuardService as RoleGuard} from "../auth/guards/role-guard.service";
import {USER_ROLE} from "../auth/app-roles";
import {StockGeneticsEditorComponent} from "./stock-genetics-editor/stock-genetics-editor.component";

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
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: EditMode.CREATE_SUB_STOCK,
        component: StockEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: EditMode.EDIT + '/swimmers/:id',
        component: StockSwimmersEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: EditMode.EDIT + '/genetics/:type/:id',
        component: StockGeneticsEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: EditMode.EDIT,
        component: StockEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: EditMode.EDIT + '/:id',
        component: StockEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
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
