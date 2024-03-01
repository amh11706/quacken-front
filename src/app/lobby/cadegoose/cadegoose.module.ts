import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LetDirective } from '@ngrx/component';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { MoveSourceModule } from '../../boats/move-source/move-source.module';
import { ManeuverSourceModule } from '../../boats/maneuver-source/maneuver-source.module';

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
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSliderModule,
    MatButtonToggleModule,
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
    MoveSourceModule,
    ManeuverSourceModule,
    LetDirective,
  ],
  exports: [
    CadegooseComponent,
    CadeHudComponent,
    StatsComponent,
    MainMenuComponent,
    CadeEntryStatusComponent,
    StatEndComponent,
    AdvancedMapComponent,
  ],
})
export class CadegooseModule { }
