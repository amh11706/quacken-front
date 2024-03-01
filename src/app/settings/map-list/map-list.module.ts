import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { LetDirective } from '@ngrx/component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
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
    MatInputModule,
    SettingsModule,
    CanvasModule,
    ScrollingModule,
    RatingModule,
    LetDirective,
  ],
  exports: [MapListComponent],
})
export class MapListModule { }
