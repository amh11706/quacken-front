import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
