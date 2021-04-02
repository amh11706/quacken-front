import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplayComponent } from './replay.component';
import { ReplayRoutingModule } from './replay-routing.module';
import { LobbyModule } from '../lobby/lobby.module';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LobbyWrapperComponent } from './lobby-wrapper/lobby-wrapper.component';
import { CadegooseComponent } from './cadegoose/cadegoose.component';
import { QdragModule } from '../qdrag/qdrag.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../settings/settings.module';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MapDebugComponent } from './cadegoose/map-debug/map-debug.component';


@NgModule({
  declarations: [ReplayComponent, LobbyWrapperComponent, CadegooseComponent, MapDebugComponent],
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
    LobbyModule,
    SettingsModule,
    QdragModule,
  ]
})
export class ReplayModule { }
