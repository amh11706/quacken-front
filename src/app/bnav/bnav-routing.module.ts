import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BnavComponent } from './bnav.component';

const routes: Routes = [{ path: '', component: BnavComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BnavRoutingModule { }
