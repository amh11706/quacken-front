import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { MatSortModule } from '@angular/material/sort';

import { LetDirective } from '@ngrx/component';
import { ProfileComponent } from './profile/profile.component';
import { EscMenuComponent } from './esc-menu.component';
import { InventoryModule } from './inventory/inventory.module';
import { ChatModule } from '../chat/chat.module';
import { LeadersComponent } from './profile/leaders/leaders.component';
import { NameModule } from '../chat/name/name.module';
import { SettingsModule } from '../settings/settings.module';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { MatchesComponent } from './profile/matches/matches.component';
import { FriendsModule } from '../chat/friends/friends.module';
import { MapListModule } from '../settings/map-list/map-list.module';
import { TeamsComponent } from './profile/matches/teams/teams.component';

@NgModule({
  declarations: [
    EscMenuComponent,
    LeadersComponent,
    ProfileComponent,
    LogoutConfirmComponent,
    MatchesComponent,
    TeamsComponent,
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
    MatMenuModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatExpansionModule,
    MatCardModule,
    MatTableModule,
    ScrollingModule,
    TableVirtualScrollModule,
    MatSortModule,
    ChatModule,
    InventoryModule,
    NameModule,
    SettingsModule,
    FriendsModule,
    MapListModule,
    LetDirective,
  ],
  exports: [EscMenuComponent],
})
export class EscMenuModule { }
