import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MutationManagerComponent} from './mutation-manager.component';
import {MutationViewerComponent} from './mutation-viewer/mutation-viewer.component';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {MutationEditorComponent} from './mutation-editor/mutation-editor.component';
import {CanDeactivateGuard} from '../deactivation-guard/can-deactivate-guard';
import {LoginGuardService as LoginGuard} from "../auth/login-guard.service";


/**
 * Exposing ignorance: If you do not have the "edit" route, the router.navigate
 * will crash if you to navigate to the "edit/:id" route.
 * I do not understand why. But I do know it is so.
 * This is a very hard earned lesson.
 */
const mutationManagerRoutes: Routes = [
  {
    path: 'mutation_manager',
    component: MutationManagerComponent,
    children: [
      {
        path: '',
        component: MutationViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'view',
        component: MutationViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: 'view/:id',
        component: MutationViewerComponent,
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.CREATE,
        component: MutationEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.CREATE_NEXT,
        component: MutationEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.EDIT,
        component: MutationEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
      {
        path: EditMode.EDIT + '/:id',
        component: MutationEditorComponent,
        canDeactivate: [ CanDeactivateGuard ],
        canActivate: [LoginGuard],
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(mutationManagerRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class MutationManagerRoutingModule { }
