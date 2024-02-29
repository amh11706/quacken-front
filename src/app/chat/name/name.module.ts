import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
