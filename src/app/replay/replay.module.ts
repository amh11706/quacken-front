import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';

import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsModule } from '../settings/settings.module';
import { QdragModule } from '../qdrag/qdrag.module';
import { CadegooseComponent } from './cadegoose/cadegoose.component';
import { LobbyWrapperComponent } from './lobby-wrapper/lobby-wrapper.component';
import { LobbyModule } from '../lobby/lobby.module';
import { ReplayRoutingModule } from './replay-routing.module';
import { ReplayComponent } from './replay.component';
import { MapDebugComponent } from './cadegoose/map-debug/map-debug.component';
import { PenaltyComponent } from './cadegoose/penalty/penalty.component';

@NgModule({
  declarations: [ReplayComponent, LobbyWrapperComponent, CadegooseComponent, MapDebugComponent, PenaltyComponent],
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
