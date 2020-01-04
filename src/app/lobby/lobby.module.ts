import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyComponent } from './lobby.component';
import { QuackenModule } from './quacken/quacken.module';
import { SpadesModule } from './spades/spades.module';
import { HexaquackModule } from './hexaquack/hexaquack.module';

@NgModule({
  declarations: [
    LobbyComponent,
    LobbyComponent,
  ],
  imports: [
    CommonModule,
    QuackenModule,
    SpadesModule,
    HexaquackModule,
  ],
  exports: []
})
export class LobbyModule { }
