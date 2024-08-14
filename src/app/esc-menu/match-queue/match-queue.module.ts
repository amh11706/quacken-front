import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatchQueueComponent } from './match-queue.component';
import { SettingsModule } from '../../settings/settings.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSliderModule,
    MatchQueueComponent,
    SettingsModule,
  ],
  exports: [MatchQueueComponent],
})
export class MatchQueueModule { }
