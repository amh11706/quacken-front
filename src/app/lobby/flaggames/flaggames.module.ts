import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  ],
  exports: [
    FlaggamesComponent,
  ],
})
export class FlaggamesModule { }
