import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrainingComponent } from './training.component';
import { QdragModule } from '../qdrag/qdrag.module';
import { TrainingRoutingModule } from './training-routing.module';
import { TwodRenderModule } from '../lobby/cadegoose/twod-render/twod-render.module';
import { MoveSourceModule } from '../boats/move-source/move-source.module';
import { ManeuverSourceModule } from '../boats/maneuver-source/maneuver-source.module';
import { MoveInputModule } from '../boats/move-input/move-input.module';
import { ChatModule } from '../chat/chat.module';
import { LobbyWrapperComponent } from './lobby-wrapper/lobby-wrapper.component';
import { LobbyModule } from '../lobby/lobby.module';

@NgModule({
  declarations: [
    TrainingComponent,
    LobbyWrapperComponent,
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
    MatTabsModule,
    ChatModule,
    LobbyModule,
  ],
})
export class TrainingModule { }
