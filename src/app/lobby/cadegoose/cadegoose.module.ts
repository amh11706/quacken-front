import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { CadegooseComponent } from './cadegoose.component';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { ChatModule } from 'src/app/chat/chat.module';
import { SettingsModule } from 'src/app/settings/settings.module';
import { QuackenModule } from '../quacken/quacken.module';
import { CadeHudComponent } from './hud/hud.component';
import { CadeEntryStatusComponent } from './cade-entry-status/cade-entry-status.component';
import { CadeBoatsComponent } from './cade-boats/cade-boats.component';

@NgModule({
  declarations: [CadegooseComponent, CadeHudComponent, CadeEntryStatusComponent, CadeBoatsComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    QdragModule,
    ChatModule,
    SettingsModule,
    QuackenModule,
  ],
  exports: [CadegooseComponent],
})
export class CadegooseModule { }
