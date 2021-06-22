import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { RecordComponent } from './record/record.component';

const routes: Routes = [
  {
    path: 'record',
    component: RecordComponent,
  },
  {
    path: 'auth',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./list/list.module').then(m => m.ListModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
