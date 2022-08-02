import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list.component';

import { LobbyListComponent } from './lobby-list/lobby-list.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    children: [
      {
        path: 'list',
        component: LobbyListComponent,
      },
      {
        path: 'bnav',
        loadChildren: () => import('../bnav/bnav.module').then(m => m.BnavModule),
      },
      {
        path: 'lobby/:id',
        loadChildren: () => import('../lobby/lobby.module').then(m => m.LobbyModule),
      },
      {
        path: 'editor',
        loadChildren: () => import('../map-editor/map-editor.module').then(m => m.MapEditorModule),
      },
      {
        path: 'replay/:id',
        loadChildren: () => import('../replay/replay.module').then(m => m.ReplayModule),
      },
      {
        path: 'training/:id',
        loadChildren: () => import('../training/training.module').then(m => m.TrainingModule),
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListRoutingModule { }
