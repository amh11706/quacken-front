import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatModule } from '../chat/chat.module';
import { InventoryModule } from './inventory/inventory.module';

import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { AccountComponent } from './account/account.component';
import { EscMenuComponent } from './esc-menu.component';
import { ProfileComponent } from './profile/profile.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { PassPromptComponent } from './account/pass-prompt/pass-prompt.component';
import { MessageComponent } from './account/message/message.component';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
  entryComponents: [LogoutConfirmComponent],
  declarations: [
    EscMenuComponent,
    LogoutConfirmComponent,
    AccountComponent,
    ProfileComponent,
    PassPromptComponent,
    MessageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatExpansionModule,
    ChatModule,
    InventoryModule,
  ],
  exports: [EscMenuComponent],
})
export class EscMenuModule { }
