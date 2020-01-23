import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TransgeneManagerComponent} from './transgene-manager.component';
import {TransgeneViewerComponent} from './transgene-viewer/transgene-viewer.component';
import {TransgeneEditorComponent} from './transgen-editor/transgene-editor.component';
import {EditMode} from '../zf-generic/zf-edit-modes';
import {CanDeactivateGuard} from '../deactivation-guard/can-deactivate-guard';
import {AuthGuard} from "../auth/auth.guard";

const transgeneManagerRoutes: Routes = [
  {
    path: 'transgene_manager',
    component: TransgeneManagerComponent,
    canActivate: [ AuthGuard ],
    children: [
      {
        path: 'view/:id',
        component: TransgeneViewerComponent,
        canActivate: [ AuthGuard ],
      },
      {
        path: '',
        component: TransgeneViewerComponent,
        canActivate: [ AuthGuard ],
      },
      {
        path: 'view',
        component: TransgeneViewerComponent,
        canActivate: [ AuthGuard ],
      },
      {
        path: EditMode.CREATE,
        component: TransgeneEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.CREATE_NEXT,
        component: TransgeneEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT,
        component: TransgeneEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
      },
      {
        path: EditMode.EDIT + '/:id',
        component: TransgeneEditorComponent,
        canActivate: [ AuthGuard ],
        canDeactivate: [ CanDeactivateGuard ],
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
