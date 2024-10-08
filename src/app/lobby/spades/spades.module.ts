import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { ChatModule } from '../../chat/chat.module';

import { SpadesComponent } from './spades.component';
import { CardComponent } from './card/card.component';
import { LastTrickComponent } from './last-trick/last-trick.component';
import { SpotComponent } from './spot/spot.component';
import { TimerComponent } from './timer/timer.component';

@NgModule({
  declarations: [SpadesComponent, CardComponent, LastTrickComponent, SpotComponent, TimerComponent],
  imports: [
    CommonModule,
    FormsModule,
    ChatModule,
    MatButtonModule,
    MatSliderModule,
  ],
  exports: [SpadesComponent],
})
export class SpadesModule { }
