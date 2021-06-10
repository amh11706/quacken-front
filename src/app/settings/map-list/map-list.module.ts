import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapListComponent } from './map-list.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { SettingsModule } from '../settings.module';
import { FormsModule } from '@angular/forms';
import { MapCardComponent } from './map-card/map-card.component';
import { CanvasModule } from 'src/app/lobby/cadegoose/canvas/canvas.module';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    MapListComponent, MapCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatCardModule,    
    MatButtonModule,
    SettingsModule,
    CanvasModule,
    ScrollingModule,
  ],
  exports: [MapListComponent]
})
export class MapListModule { }