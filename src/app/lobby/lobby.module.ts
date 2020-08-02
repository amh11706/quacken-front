import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyComponent } from './lobby.component';
import { QuackenModule } from './quacken/quacken.module';
import { SpadesModule } from './spades/spades.module';
import { HexaquackModule } from './hexaquack/hexaquack.module';
import { CadegooseModule } from './cadegoose/cadegoose.module';
import { LobbyRoutingModule } from './lobby-routing.module';

@NgModule({
  declarations: [
    LobbyComponent,
    LobbyComponent,
  ],
  imports: [
    CommonModule,
    LobbyRoutingModule,
    QuackenModule,
    SpadesModule,
    HexaquackModule,
    CadegooseModule,
  ],
  exports: []
})
export class LobbyModule { }
