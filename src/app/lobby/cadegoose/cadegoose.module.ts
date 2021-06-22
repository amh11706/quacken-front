import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { NameModule } from '../../chat/name/name.module';
import { SettingsModule } from '../../settings/settings.module';
import { ChatModule } from '../../chat/chat.module';
import { QdragModule } from '../../qdrag/qdrag.module';
import { TwodRenderModule } from './twod-render/twod-render.module';
import { CadegooseComponent } from './cadegoose.component';
import { QuackenModule } from '../quacken/quacken.module';
import { CadeHudComponent } from './hud/hud.component';
import { CadeEntryStatusComponent } from './cade-entry-status/cade-entry-status.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { StatsComponent } from './stats/stats.component';
import { StatEndComponent } from './stat-end/stat-end.component';
import { ThreedRenderComponent } from './threed-render/threed-render.component';
import { RatingModule } from '../../settings/rating/rating.module';

@NgModule({
  declarations: [
    CadegooseComponent, CadeHudComponent, CadeEntryStatusComponent,
    MainMenuComponent, StatsComponent, StatEndComponent,
    ThreedRenderComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    QdragModule,
    ChatModule,
    SettingsModule,
    QuackenModule,
    NameModule,
    TwodRenderModule,
    RatingModule,
  ],
  exports: [
    CadegooseComponent,
    CadeHudComponent,
    StatsComponent,
    MainMenuComponent,
    CadeEntryStatusComponent,
    StatEndComponent,
  ],
})
export class CadegooseModule { }
