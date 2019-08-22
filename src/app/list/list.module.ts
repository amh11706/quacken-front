import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule, MatIconModule, MatSelectModule,
} from '@angular/material';
import { ChatModule } from '../chat/chat.module';

import { ListComponent } from './list.component';
import { LobbyModule } from '../lobby/lobby.module';
import { SettingsModule } from '../settings/settings.module';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    ChatModule,
    LobbyModule,
    SettingsModule,
  ],
  exports: [ListComponent],
})
export class ListModule { }
