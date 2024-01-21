import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { ManeuverSourceComponent } from './maneuver-source.component';

@NgModule({
  declarations: [
    ManeuverSourceComponent,
  ],
  exports: [
    ManeuverSourceComponent,
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
  ],
})
export class ManeuverSourceModule { }
