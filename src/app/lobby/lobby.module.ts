import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyComponent } from './lobby.component';
import { QuackenModule } from './quacken/quacken.module';
import { CadegooseModule } from './cadegoose/cadegoose.module';
import { SeabattleModule } from './seabattle/seabattle.module';
import { LobbyRoutingModule } from './lobby-routing.module';
import { FlaggamesModule } from './flaggames/flaggames.module';
import { MapinfoComponent } from './mapinfo/mapinfo.component';
import { BoardadmiralComponent } from './boardadmiral/boardadmiral.component';

@NgModule({
  declarations: [
    LobbyComponent,
  ],
  imports: [
    CommonModule,
    LobbyRoutingModule,
    QuackenModule,
    CadegooseModule,
    SeabattleModule,
    FlaggamesModule,
    MapinfoComponent,
    BoardadmiralComponent,
  ],
  exports: [LobbyComponent],
})
export class LobbyModule { }
