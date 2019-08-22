import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LobbyComponent } from './lobby.component';
import { QuackenModule } from './quacken/quacken.module';
import { SpadesModule } from './spades/spades.module';

@NgModule({
  declarations: [
    LobbyComponent,
    LobbyComponent,
  ],
  imports: [
    CommonModule,
    QuackenModule,
    SpadesModule,
  ],
  exports: []
})
export class LobbyModule { }
