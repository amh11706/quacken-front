import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { ChatModule } from '../chat/chat.module';
import { ListComponent } from './list.component';
import { SettingsModule } from '../settings/settings.module';
import { ListRoutingModule } from './list-routing.module';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    ListRoutingModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    ChatModule,
    SettingsModule,
  ],
  exports: [ListComponent],
})
export class ListModule { }
