import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { SettingComponent } from './setting/setting.component';
import { SettingsComponent } from './settings.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule,
    QdragModule,
    NgSelectModule,
  ],
  exports: [SettingComponent, SettingsComponent]
})
export class SettingsModule { }
