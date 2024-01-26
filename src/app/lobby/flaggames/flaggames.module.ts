import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { LetDirective } from '@ngrx/component';
import { FlaggamesComponent } from './flaggames.component';
import { FgMainMenuComponent } from './fg-main-menu/fg-main-menu.component';
import { CadegooseModule } from '../cadegoose/cadegoose.module';
import { TwodRenderModule } from '../cadegoose/twod-render/twod-render.module';
import { ThreedRenderModule } from '../cadegoose/threed-render/threed-render.module';
import { SettingsModule } from '../../settings/settings.module';
import { NameModule } from '../../chat/name/name.module';
import { MapEditorModule } from '../../map-editor/map-editor.module';
import { FgHelpComponent } from './fg-help/fg-help.component';

@NgModule({
  declarations: [
    FlaggamesComponent,
    FgMainMenuComponent,
    FgHelpComponent,
  ],
  imports: [
    CommonModule,
    CadegooseModule,
    TwodRenderModule,
    ThreedRenderModule,
    SettingsModule,
    NameModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatSliderModule,
    MatIconModule,
    MatTooltipModule,
    MapEditorModule,
    LetDirective,
  ],
  exports: [
    FlaggamesComponent,
  ],
})
export class FlaggamesModule { }
