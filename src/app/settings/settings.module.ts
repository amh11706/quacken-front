import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { SettingComponent } from './setting/setting.component';
import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';
import {
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatSliderModule,
  MatSelectModule,
  MatCheckboxModule,
} from '@angular/material';
import { QdragModule } from '../qdrag/qdrag.module';
import { CustomMapComponent } from './custom-map/custom-map.component';

@NgModule({
  declarations: [SettingComponent, SettingsComponent, CustomMapComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSliderModule,
    MatSelectModule,
    MatCheckboxModule,
    QdragModule,
    NgSelectModule,
  ],
  providers: [SettingsService],
  exports: [SettingComponent, SettingsComponent]
})
export class SettingsModule { }
