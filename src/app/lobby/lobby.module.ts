import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyComponent } from './lobby.component';
import { QuackenModule } from './quacken/quacken.module';
import { SpadesModule } from './spades/spades.module';
import { CadegooseModule } from './cadegoose/cadegoose.module';
import { SeabattleModule } from './seabattle/seabattle.module';
import { LobbyRoutingModule } from './lobby-routing.module';
import { FlaggamesModule } from './flaggames/flaggames.module';

@NgModule({
  declarations: [
    LobbyComponent,
  ],
  imports: [
    CommonModule,
    LobbyRoutingModule,
    QuackenModule,
    SpadesModule,
    CadegooseModule,
    SeabattleModule,
    FlaggamesModule,
  ],
  exports: [LobbyComponent],
})
export class LobbyModule { }
