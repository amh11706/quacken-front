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

import { QdragModule } from '../../qdrag/qdrag.module';
import { ChatModule } from '../../chat/chat.module';
import { SettingsModule } from '../../settings/settings.module';

import { HudComponent } from './hud/hud.component';
import { EntryStatusComponent } from './entry-status/entry-status.component';
import { BoatsComponent } from './boats/boats.component';
import { QuackenComponent } from './quacken.component';

@NgModule({
  declarations: [
    HudComponent,
    EntryStatusComponent,
    BoatsComponent,
    QuackenComponent,
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
  exports: [QuackenComponent]
})
export class QuackenModule { }
