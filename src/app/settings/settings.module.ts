import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatIconModule } from '@angular/material/icon';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { SettingComponent } from './setting/setting.component';
import { SettingsComponent } from './settings.component';
import { AccountComponent } from './account/account.component';
import { MessageComponent } from './account/message/message.component';
import { KeyBindingComponent } from './key-binding/key-binding.component';
import { BinderComponent } from './key-binding/binder/binder.component';
import { ExitPromptComponent } from './key-binding/exit-prompt/exit-prompt.component';
import { CustomMapComponent } from './custom-map/custom-map.component';
import { BotSettingComponent } from './bot-setting/bot-setting.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { JobberQualityComponent } from './jobber-quality/jobber-quality.component';

@NgModule({
  declarations: [
    SettingComponent,
    SettingsComponent,
    AccountComponent,
    MessageComponent,
    KeyBindingComponent,
    BinderComponent,
    ExitPromptComponent,
    CustomMapComponent,
    BotSettingComponent,
    AdvancedComponent,
    JobberQualityComponent,
  ],
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
    MatTooltipModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatDialogModule,
    MatMenuModule,
  ],
  exports: [SettingComponent, SettingsComponent],
})
export class SettingsModule { }
