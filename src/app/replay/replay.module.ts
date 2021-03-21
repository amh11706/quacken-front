import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplayComponent } from './replay.component';
import { ReplayRoutingModule } from './replay-routing.module';
import { LobbyModule } from '../lobby/lobby.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LobbyWrapperComponent } from './lobby-wrapper/lobby-wrapper.component';
import { CadegooseComponent } from './cadegoose/cadegoose.component';
import { QdragModule } from '../qdrag/qdrag.module';
import { MatTabsModule } from '@angular/material/tabs';



@NgModule({
  declarations: [ReplayComponent, LobbyWrapperComponent, CadegooseComponent],
  imports: [
    CommonModule,
    ReplayRoutingModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    LobbyModule,
    QdragModule,
  ]
})
export class ReplayModule { }
