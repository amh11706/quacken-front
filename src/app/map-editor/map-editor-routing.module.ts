import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapEditorComponent } from './map-editor.component';

const routes: Routes = [
  {
    path: '',
    component: MapEditorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapEditorRoutingModule { }
