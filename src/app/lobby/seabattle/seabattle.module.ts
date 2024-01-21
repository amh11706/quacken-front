import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { ChatModule } from '../../chat/chat.module';
import { NameModule } from '../../chat/name/name.module';
import { QdragModule } from '../../qdrag/qdrag.module';
import { SettingsModule } from '../../settings/settings.module';
import { QuackenModule } from '../quacken/quacken.module';
import { TwodRenderModule } from '../cadegoose/twod-render/twod-render.module';
import { SbMainMenuComponent } from './sb-main-menu/sb-main-menu.component';
import { SbStatsComponent } from './sb-stats/sb-stats.component';
import { SbEntryStatusComponent } from './sb-entry-status/sb-entry-status.component';
import { CadegooseModule } from '../cadegoose/cadegoose.module';
import { SeabattleComponent } from './seabattle.component';
import { ThreedRenderModule } from '../cadegoose/threed-render/threed-render.module';

@NgModule({
  declarations: [SeabattleComponent, SbEntryStatusComponent, SbStatsComponent, SbMainMenuComponent],
  imports: [
    CommonModule,
    CadegooseModule,
    TwodRenderModule,
    ThreedRenderModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    QdragModule,
    ChatModule,
    SettingsModule,
    QuackenModule,
    NameModule,
  ],
  exports: [SeabattleComponent],
})
export class SeabattleModule { }
