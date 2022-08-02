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
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

import { MoveInputModule } from '../../boats/move-input/move-input.module';
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
import { RatingModule } from '../../settings/rating/rating.module';
import { AdvancedMapComponent } from './advanced-map/advanced-map.component';
import { ThreedRenderModule } from './threed-render/threed-render.module';
import { MapEditorModule } from '../../map-editor/map-editor.module';

@NgModule({
  declarations: [
    CadegooseComponent, CadeHudComponent, CadeEntryStatusComponent,
    MainMenuComponent, StatsComponent, StatEndComponent,
    AdvancedMapComponent,
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
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    QdragModule,
    ChatModule,
    SettingsModule,
    QuackenModule,
    NameModule,
    TwodRenderModule,
    ThreedRenderModule,
    RatingModule,
    MapEditorModule,
    MoveInputModule,
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
