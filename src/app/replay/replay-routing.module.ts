import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LobbyComponent } from '../lobby/lobby.component';
import { ReplayComponent } from './replay.component';


const routes: Routes = [
  {
    path: '',
    component: ReplayComponent,
    children: [
      {
        component: LobbyComponent,
        path: '',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReplayRoutingModule { }
