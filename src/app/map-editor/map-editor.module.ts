import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

import { MatIconModule } from '@angular/material/icon';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { WinConditionsComponent } from './entity-editor/win-conditions/win-conditions.component';
import { TagsComponent } from './tags/tags.component';

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
    TagsComponent,
  ],
  imports: [
    CommonModule,
    MapEditorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    QdragModule,
    ChatModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatChipsModule,
    TwodRenderModule,
  ],
  providers: [TitleCasePipe],
  exports: [MapEditorComponent, ObstaclesComponent],
})
export class MapEditorModule { }
