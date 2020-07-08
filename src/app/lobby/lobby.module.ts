import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyComponent } from './lobby.component';
import { QuackenModule } from './quacken/quacken.module';
import { SpadesModule } from './spades/spades.module';
import { HexaquackModule } from './hexaquack/hexaquack.module';
import { BnavComponent } from './bnav/bnav.component';
import { LobbyRoutingModule } from './lobby-routing.module';

@NgModule({
  declarations: [
    LobbyComponent,
    LobbyComponent,
    BnavComponent,
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
