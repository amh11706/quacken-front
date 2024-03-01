import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';

import { LetDirective } from '@ngrx/component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
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
    LetDirective,
  ],
  exports: [MapListComponent],
})
export class MapListModule { }
