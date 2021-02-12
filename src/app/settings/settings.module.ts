import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

import { SettingComponent } from './setting/setting.component';
import { SettingsComponent } from './settings.component';
import { CustomMapComponent } from './custom-map/custom-map.component';
import { AccountComponent } from './account/account.component';
import { MessageComponent } from './account/message/message.component';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [SettingComponent, SettingsComponent, CustomMapComponent, AccountComponent, MessageComponent],
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
    NgSelectModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
  ],
  exports: [SettingComponent, SettingsComponent]
})
export class SettingsModule { }
