import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatExpansionModule,
  MatIconModule,
  MatMenuModule,
  MatButtonModule,
} from '@angular/material';

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
