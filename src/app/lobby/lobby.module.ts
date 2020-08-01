import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyComponent } from './lobby.component';
import { QuackenModule } from './quacken/quacken.module';
import { SpadesModule } from './spades/spades.module';
import { HexaquackModule } from './hexaquack/hexaquack.module';
import { LobbyRoutingModule } from './lobby-routing.module';
import { CadegooseComponent } from './cadegoose/cadegoose.component';

@NgModule({
  declarations: [
    LobbyComponent,
    LobbyComponent,
    CadegooseComponent,
  ],
  imports: [
    CommonModule,
    LobbyRoutingModule,
    QuackenModule,
    SpadesModule,
    HexaquackModule,
  ],
  exports: []
})
export class LobbyModule { }
