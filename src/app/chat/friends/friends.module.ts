import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { QdragModule } from '../../qdrag/qdrag.module';

import { FriendsComponent } from './friends.component';
import { FriendsService } from './friends.service';
import { NameModule } from '../name/name.module';

@NgModule({
  declarations: [FriendsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    MatMenuModule,
    MatButtonModule,
    QdragModule,
    NameModule,
  ],
  providers: [FriendsService],
  exports: [FriendsComponent]
})
export class FriendsModule { }
