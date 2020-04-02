import {RouterModule, Routes} from "@angular/router";
import {UserAdminComponent} from "./user-admin.component";
import {UserViewerComponent} from "./user-viewer/user-viewer.component";
import {LoginGuardService as LoginGuard} from "../auth/login-guard.service";
import {UserEditorComponent} from "./user-editor/user-editor.component";
import {EditMode} from "../zf-generic/zf-edit-modes";
import {CanDeactivateGuard} from "../deactivation-guard/can-deactivate-guard";
import {NgModule} from "@angular/core";
import {TransgeneEditorComponent} from "../transgene-manager/transgen-editor/transgene-editor.component";

const userAdminRoutes: Routes = [
  {
    path: 'user_admin',
    component: UserAdminComponent,
    children: [
      {
        path: '',
        component: UserViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'view',
        component: UserViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'view/:id',
        component: UserViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.CREATE,
        component: UserEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.EDIT,
        component: UserEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.EDIT + '/:id',
        component: UserEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
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
