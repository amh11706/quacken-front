import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { QdragModule } from '../../qdrag/qdrag.module';

import { NameModule } from '../name/name.module';
import { PlayerListComponent } from './player-list/player-list.component';

@NgModule({
  declarations: [PlayerListComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    MatTabsModule,
    MatTooltipModule,
    QdragModule,
    NameModule,
  ],
  exports: [PlayerListComponent],
})
export class FriendsModule { }
