import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { NameComponent } from './name.component';
import { RankCircleComponent } from '../rank-circle/rank-circle.component';

@NgModule({
  declarations: [NameComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    MatTooltipModule,
    RankCircleComponent,
  ],
  exports: [NameComponent],
})
export class NameModule { }
