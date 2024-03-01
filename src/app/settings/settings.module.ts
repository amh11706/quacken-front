import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
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
