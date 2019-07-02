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
} from '@angular/material';

import { QdragModule } from '../qdrag/qdrag.module';
import { ChatModule } from '../chat/chat.module';

import { LobbyComponent } from './lobby.component';
import { HudComponent } from './hud/hud.component';
import { EntryStatusComponent } from './entry-status/entry-status.component';
import { BoatsComponent } from './boats/boats.component';

// TODO: move settings to its own module
import { SettingsComponent } from '../settings/settings.component';

@NgModule({
  declarations: [
    LobbyComponent,
    HudComponent,
    EntryStatusComponent,
    BoatsComponent,
    SettingsComponent,
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
    QdragModule,
    ChatModule,
  ],
  exports: [LobbyComponent]
})
export class LobbyModule { }
