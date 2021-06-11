import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapListComponent } from './map-list.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { SettingsModule } from '../settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MapCardComponent } from './map-card/map-card.component';
import { CanvasModule } from 'src/app/lobby/cadegoose/canvas/canvas.module';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MapTagSearchComponent } from './map-tag-search/map-tag-search.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MapInputSearchComponent } from './map-input-search/map-input-search.component';

@NgModule({
  declarations: [
    MapListComponent, MapCardComponent, MapTagSearchComponent, MapInputSearchComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCardModule,    
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    SettingsModule,
    CanvasModule,
    ScrollingModule,
  ],
  exports: [MapListComponent]
})
export class MapListModule { }
