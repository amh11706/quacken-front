import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { CreateComponent } from './login/create/create.component';
import { ListComponent } from './list/list.component';
import { LobbyComponent } from './lobby/lobby.component';
import { AuthGuard } from './auth.guard';
import { MapEditorComponent } from './map-editor/map-editor.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'create',
    component: CreateComponent,
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'list',
        component: ListComponent,
      },
      {
        path: 'lobby/:id',
        component: LobbyComponent,
      },
      {
        path: 'editor',
        component: MapEditorComponent,
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
