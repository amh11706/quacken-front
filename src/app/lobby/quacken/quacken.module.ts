import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { QdragModule } from '../../qdrag/qdrag.module';
import { ChatModule } from '../../chat/chat.module';
import { SettingsModule } from '../../settings/settings.module';

import { HudComponent } from './hud/hud.component';
import { EntryStatusComponent } from './entry-status/entry-status.component';
import { BoatsComponent } from './boats/boats.component';
import { QuackenComponent } from './quacken.component';
import { MapComponent } from './map/map.component';

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
  ],
  exports: [
    QuackenComponent,
    BoatsComponent,
    EntryStatusComponent,
    HudComponent,
  ]
})
export class QuackenModule { }
