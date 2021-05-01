import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { QdragModule } from '../../qdrag/qdrag.module';

import { FriendsComponent } from './friends.component';
import { NameModule } from '../name/name.module';
import { MatTabsModule } from '@angular/material/tabs';
import { PlayerListComponent } from './player-list/player-list.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [FriendsComponent, PlayerListComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    QdragModule,
    NameModule,
  ],
  exports: [FriendsComponent, PlayerListComponent],
})
export class FriendsModule { }
