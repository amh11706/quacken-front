import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { QdragModule } from '../../qdrag/qdrag.module';
import { ChatModule } from '../../chat/chat.module';
import { SettingsModule } from '../../settings/settings.module';

import { HudComponent } from './hud/hud.component';
import { EntryStatusComponent } from './entry-status/entry-status.component';
import { QuackenComponent } from './quacken.component';
import { MoveInputModule } from '../../boats/move-input/move-input.module';

@NgModule({
  declarations: [
    HudComponent,
    EntryStatusComponent,
    QuackenComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    QdragModule,
    ChatModule,
    SettingsModule,
    MoveInputModule,
  ],
  exports: [
    QuackenComponent,
    EntryStatusComponent,
    HudComponent,
  ],
})
export class QuackenModule { }
