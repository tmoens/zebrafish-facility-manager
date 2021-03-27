import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TransgeneManagerComponent} from './transgene-manager.component';
import {TransgeneViewerComponent} from './transgene-viewer/transgene-viewer.component';
import {TransgeneEditorComponent} from './transgen-editor/transgene-editor.component';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {CanDeactivateGuard} from '../guards/can-deactivate-guard';
import {LoginGuardService as LoginGuard} from "../auth/guards/login-guard.service";
import {RoleGuardService as RoleGuard} from "../auth/guards/role-guard.service";
import {ADMIN_ROLE, USER_ROLE} from '../auth/app-roles';
import {ExcelImporterComponent} from '../excel-importer/excel-importer.component';

const transgeneManagerRoutes: Routes = [
  {
    path: 'transgene_manager',
    component: TransgeneManagerComponent,
    children: [
      {
        path: 'view/:id',
        component: TransgeneViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'view',
        component: TransgeneViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: '',
        component: TransgeneViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.CREATE,
        component: TransgeneEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: EditMode.CREATE_NEXT,
        component: TransgeneEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: EditMode.EDIT,
        component: TransgeneEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: EditMode.EDIT + '/:id',
        component: TransgeneEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: USER_ROLE
        }
      },
      {
        path: 'import',
        component: ExcelImporterComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: ADMIN_ROLE
        }
      },
      {
        path: 'migrate',
        component: ExcelImporterComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [RoleGuard],
        data: {
          permittedRole: ADMIN_ROLE
        }
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(transgeneManagerRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class TransgeneManagerRoutingModule { }
