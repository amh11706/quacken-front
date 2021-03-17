import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatModule } from '../chat/chat.module';
import { InventoryModule } from './inventory/inventory.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { EscMenuComponent } from './esc-menu.component';
import { ProfileComponent } from './profile/profile.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeadersComponent } from './profile/leaders/leaders.component';
import { NameModule } from '../chat/name/name.module';
import { SettingsModule } from '../settings/settings.module';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { MatchesComponent } from './profile/matches/matches.component';

@NgModule({
  declarations: [
    EscMenuComponent,
    LeadersComponent,
    ProfileComponent,
    LogoutConfirmComponent,
    MatchesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    ChatModule,
    InventoryModule,
    NameModule,
    SettingsModule,
  ],
  exports: [EscMenuComponent],
})
export class EscMenuModule { }
