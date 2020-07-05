import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

import { NameComponent } from './name.component';

@NgModule({
  declarations: [NameComponent],
  imports: [
    CommonModule,
    MatMenuModule,
  ],
  exports: [NameComponent]
})
export class NameModule { }
