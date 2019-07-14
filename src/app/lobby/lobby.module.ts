import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatSliderModule,
  MatSelectModule,
  MatButtonModule,
  MatCheckboxModule,
} from '@angular/material';

import { QdragModule } from '../qdrag/qdrag.module';
import { ChatModule } from '../chat/chat.module';

import { LobbyComponent } from './lobby.component';
import { HudComponent } from './hud/hud.component';
import { EntryStatusComponent } from './entry-status/entry-status.component';
import { BoatsComponent } from './boats/boats.component';

// TODO: move settings to its own module
import { SettingsModule } from '../settings/settings.module';

@NgModule({
  declarations: [
    LobbyComponent,
    HudComponent,
    EntryStatusComponent,
    BoatsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSliderModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    QdragModule,
    ChatModule,
    SettingsModule,
  ],
  exports: [LobbyComponent]
})
export class LobbyModule { }
