import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { QdragModule } from '../../qdrag/qdrag.module';
import { ChatModule } from '../../chat/chat.module';
import { SettingsModule } from '../../settings/settings.module';

import { HudComponent } from './hud/hud.component';
import { EntryStatusComponent } from './entry-status/entry-status.component';
import { BoatsComponent } from './boats/boats.component';
import { QuackenComponent } from './quacken.component';
import { MapComponent } from './map/map.component';
import { MoveInputModule } from '../../boats/move-input/move-input.module';

@NgModule({
  declarations: [
    HudComponent,
    EntryStatusComponent,
    BoatsComponent,
    QuackenComponent,
    MapComponent,
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
    BoatsComponent,
    EntryStatusComponent,
    HudComponent,
  ],
})
export class QuackenModule { }
