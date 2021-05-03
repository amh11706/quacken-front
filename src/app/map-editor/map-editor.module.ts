import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { QdragModule } from '../qdrag/qdrag.module';
import { ChatModule } from '../chat/chat.module';
import { TwodRenderModule } from '../lobby/cadegoose/twod-render/twod-render.module';

import { MapEditorComponent } from './map-editor.component';
import { TileSetComponent } from './tile-set/tile-set.component';
import { StructureSetComponent } from './structure-set/structure-set.component';
import { StructureMapComponent } from './structure-map/structure-map.component';
import { SettingsComponent } from './settings/settings.component';
import { GuideComponent } from './guide/guide.component';
import { ObstaclesComponent } from './obstacles/obstacles.component';
import { MapComponent } from './map/map.component';
import { MapEditorRoutingModule } from './map-editor-routing.module';
import { TmapSetComponent } from './tmap-set/tmap-set.component';
import { EntityEditorComponent } from './entity-editor/entity-editor.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { WinConditionsComponent } from './entity-editor/win-conditions/win-conditions.component';

@NgModule({
  declarations: [
    MapEditorComponent,
    TileSetComponent,
    StructureSetComponent,
    StructureMapComponent,
    SettingsComponent,
    GuideComponent,
    ObstaclesComponent,
    MapComponent,
    TmapSetComponent,
    EntityEditorComponent,
    WinConditionsComponent,
  ],
  imports: [
    CommonModule,
    MapEditorRoutingModule,
    FormsModule,
    QdragModule,
    ChatModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatExpansionModule,
    TwodRenderModule,
  ],
  exports: [MapEditorComponent]
})
export class MapEditorModule { }
