import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { MatSortModule } from '@angular/material/sort';

import { LetDirective } from '@ngrx/component';
import { MatLegacyChipsModule } from '@angular/material/legacy-chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
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
import { RankCircleComponent } from '../chat/rank-circle/rank-circle.component';

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
    MatLegacyChipsModule,
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
    RankCircleComponent,
  ],
  exports: [EscMenuComponent],
})
export class EscMenuModule { }
