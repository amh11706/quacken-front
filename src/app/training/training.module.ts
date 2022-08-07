import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TrainingComponent } from './training.component';
import { QdragModule } from '../qdrag/qdrag.module';
import { TrainingRoutingModule } from './training-routing.module';
import { TwodRenderModule } from '../lobby/cadegoose/twod-render/twod-render.module';
import { MoveSourceModule } from '../boats/move-source/move-source.module';
import { ManeuverSourceModule } from '../boats/maneuver-source/maneuver-source.module';
import { MoveInputModule } from '../boats/move-input/move-input.module';
import { ChatModule } from '../chat/chat.module';

@NgModule({
  declarations: [
    TrainingComponent,
  ],
  imports: [
    TrainingRoutingModule,
    CommonModule,
    QdragModule,
    TwodRenderModule,
    MoveSourceModule,
    ManeuverSourceModule,
    MoveInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    ChatModule,
  ],
})
export class TrainingModule { }
