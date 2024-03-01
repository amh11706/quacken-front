import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QdragModule } from '../../qdrag/qdrag.module';

import { NameModule } from '../name/name.module';
import { PlayerListComponent } from './player-list/player-list.component';

@NgModule({
  declarations: [PlayerListComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatTooltipModule,
    QdragModule,
    NameModule,
  ],
  exports: [PlayerListComponent],
})
export class FriendsModule { }
