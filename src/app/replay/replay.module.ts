import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { SettingsModule } from '../settings/settings.module';
import { QdragModule } from '../qdrag/qdrag.module';
import { CadegooseComponent } from './cadegoose/cadegoose.component';
import { ReplayWrapperComponent } from './lobby-wrapper/lobby-wrapper.component';
import { LobbyModule } from '../lobby/lobby.module';
import { ReplayRoutingModule } from './replay-routing.module';
import { ReplayComponent } from './replay.component';
import { MapDebugComponent } from './cadegoose/map-debug/map-debug.component';
import { PenaltyComponent } from './cadegoose/penalty/penalty.component';

@NgModule({
  declarations: [ReplayComponent, ReplayWrapperComponent, CadegooseComponent, MapDebugComponent, PenaltyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReplayRoutingModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTooltipModule,
    LobbyModule,
    SettingsModule,
    QdragModule,
  ],
})
export class ReplayModule { }
