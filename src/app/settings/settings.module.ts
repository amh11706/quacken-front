import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@NgModule({
  declarations: [SettingComponent, SettingsComponent],
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
  ],
  providers: [SettingsService],
  exports: [SettingComponent, SettingsComponent]
})
export class SettingsModule { }
