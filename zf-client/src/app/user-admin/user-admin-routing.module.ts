import {RouterModule, Routes} from "@angular/router";
import {UserAdminComponent} from "./user-admin.component";
import {UserViewerComponent} from "./user-viewer/user-viewer.component";
import {LoginGuardService as LoginGuard} from "../auth/login-guard.service";
import {UserEditorComponent} from "./user-editor/user-editor.component";
import {EditMode} from "../zf-generic/zf-edit-modes";
import {CanDeactivateGuard} from "../deactivation-guard/can-deactivate-guard";
import {NgModule} from "@angular/core";
import {RoleGuardService as RoleGuard} from "../auth/role-guard.service";
import {ADMIN_ROLE} from "../common/auth/zf-roles";

const userAdminRoutes: Routes = [
  {
    path: 'user_admin',
    component: UserAdminComponent,
    children: [
      {
        path: '',
        component: UserViewerComponent,
        canActivate: [RoleGuard],
        data: {
          permittedRole: ADMIN_ROLE
        }
      },
      {
        path: 'view',
        component: UserViewerComponent,
        canActivate: [RoleGuard],
        data: {
          permittedRole: ADMIN_ROLE
        }
      },
      {
        path: 'view/:id',
        component: UserViewerComponent,
        data: {
          permittedRole: ADMIN_ROLE
        }
      },
      {
        path: EditMode.CREATE,
        component: UserEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          permittedRole: ADMIN_ROLE
        }
      },
      {
        path: EditMode.EDIT,
        component: UserEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          permittedRole: ADMIN_ROLE
        }
      },
      {
        path: EditMode.EDIT + '/:id',
        component: UserEditorComponent,
        canDeactivate: [CanDeactivateGuard],
        data: {
          permittedRole: ADMIN_ROLE
        }
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(userAdminRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class UserAdminRoutingModule { }
