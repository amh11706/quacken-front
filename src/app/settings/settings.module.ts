import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatChipsModule } from '@angular/material/chips';
import { SettingComponent } from './setting/setting.component';
import { SettingsComponent } from './settings.component';
import { AccountComponent } from './account/account.component';
import { MessageComponent } from './account/message/message.component';
import { KeyBindingComponent } from './key-binding/key-binding.component';
import { BinderComponent } from './key-binding/binder/binder.component';
import { ExitPromptComponent } from './key-binding/exit-prompt/exit-prompt.component';
import { BotSettingComponent } from './bot-setting/bot-setting.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { JobberQualityComponent } from './jobber-quality/jobber-quality.component';
import { BaShipSettingComponent } from './ba-ship-setting/ba-ship-setting';
import { ShipListComponent } from './ship-list/ship-list.component';

@NgModule({
  declarations: [
    SettingComponent,
    SettingsComponent,
    AccountComponent,
    MessageComponent,
    KeyBindingComponent,
    BinderComponent,
    ExitPromptComponent,
    BotSettingComponent,
    AdvancedComponent,
    JobberQualityComponent,
    BaShipSettingComponent,
    ShipListComponent,
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
    MatTooltipModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule,
    PickerComponent,
    EmojiComponent,
  ],
  exports: [SettingComponent, SettingsComponent, ShipListComponent],
})
export class SettingsModule { }
