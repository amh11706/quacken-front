import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { CreateComponent } from './login/create/create.component';
import { ListComponent } from './list/list.component';
import { AuthGuard } from './auth.guard';
import { MapEditorComponent } from './map-editor/map-editor.component';
import { TermsComponent } from './login/terms/terms.component';
import { PrivacyComponent } from './login/privacy/privacy.component';
import { ResetComponent } from './login/reset/reset.component';
import { LobbyComponent } from './lobby/lobby.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'terms',
    component: TermsComponent,
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
  },
  {
    path: 'create',
    component: CreateComponent,
  },
  {
    path: 'reset/:token',
    component: ResetComponent,
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
