import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TransgeneManagerComponent} from './transgene-manager.component';
import {TransgeneViewerComponent} from './transgene-viewer/transgene-viewer.component';
import {TransgeneEditorComponent} from './transgen-editor/transgene-editor.component';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {CanDeactivateGuard} from '../deactivation-guard/can-deactivate-guard';
import {LoginGuardService as LoginGuard} from "../auth/login-guard.service";
import {RoleGuardService as RoleGuard} from "../auth/role-guard.service";
import {USER_ROLE} from "../common/auth/zf-roles";

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
        path: '',
        component: TransgeneViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'view',
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
