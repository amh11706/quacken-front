import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { NameComponent } from './name.component';

@NgModule({
  declarations: [NameComponent],
  imports: [
    CommonModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  exports: [NameComponent],
})
export class NameModule { }
