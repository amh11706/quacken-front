import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatCheckboxModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatDialogModule } from '@angular/material';

import { QdragModule } from '../qdrag/qdrag.module';
import { ChatModule } from '../chat/chat.module';

import { MapEditorComponent } from './map-editor.component';
import { TileSetComponent } from './tile-set/tile-set.component';
import { StructureSetComponent } from './structure-set/structure-set.component';
import { StructureMapComponent } from './structure-map/structure-map.component';
import { SettingsComponent } from './settings/settings.component';
import { GuideComponent } from './guide/guide.component';
import { ObstaclesComponent } from './obstacles/obstacles.component';
import { MapComponent } from './map/map.component';

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
  ],
  entryComponents: [GuideComponent],
  imports: [
    CommonModule,
    FormsModule,
    QdragModule,
    ChatModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  exports: [MapEditorComponent]
})
export class MapEditorModule { }
