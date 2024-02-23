import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { FormsModule } from '@angular/forms';
import { MoveSourceComponent } from './move-source.component';

@NgModule({
  declarations: [
    MoveSourceComponent,
  ],
  exports: [
    MoveSourceComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
})
export class MoveSourceModule { }
