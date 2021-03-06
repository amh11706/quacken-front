import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplayComponent } from './replay.component';
import { ReplayRoutingModule } from './replay-routing.module';
import { LobbyModule } from '../lobby/lobby.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [ReplayComponent],
  imports: [
    CommonModule,
    ReplayRoutingModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    LobbyModule,
  ]
})
export class ReplayModule { }
