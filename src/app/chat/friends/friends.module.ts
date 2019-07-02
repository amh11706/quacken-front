import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatExpansionModule,
  MatIconModule,
} from '@angular/material';

import { QdragModule } from '../../qdrag/qdrag.module';

import { FriendsComponent } from './friends.component';
import { FriendsService } from './friends.service';

@NgModule({
  declarations: [FriendsComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatExpansionModule,
    QdragModule,
  ],
  providers: [FriendsService],
  exports: [FriendsComponent]
})
export class FriendsModule { }
