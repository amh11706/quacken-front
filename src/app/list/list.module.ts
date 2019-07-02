import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule,
} from '@angular/material';
import { ChatModule } from '../chat/chat.module';

import { ListComponent } from './list.component';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    ChatModule,
  ],
  exports: [ListComponent],
})
export class ListModule { }
