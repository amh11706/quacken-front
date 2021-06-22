import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';

import { RatingModule } from '../rating/rating.module';
import { MapFilterComponent } from './map-filter/map-filter.component';
import { MapCardComponent } from './map-card/map-card.component';
import { SettingsModule } from '../settings.module';
import { MapListComponent } from './map-list.component';
import { CanvasModule } from '../../lobby/cadegoose/canvas/canvas.module';

@NgModule({
  declarations: [
    MapListComponent, MapCardComponent, MapFilterComponent,
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
    MatDialogModule,
    MatBottomSheetModule,
    MatListModule,
    SettingsModule,
    CanvasModule,
    ScrollingModule,
    RatingModule,
  ],
  exports: [MapListComponent],
})
export class MapListModule { }
