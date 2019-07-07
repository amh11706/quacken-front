import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule, MatMenuModule } from '@angular/material';

import { NameModule } from './name/name.module';
import { ChatComponent } from './chat.component';
import { ChatService } from './chat.service';

@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    NameModule,
  ],
  providers: [ChatService],
  exports: [ChatComponent]
})
export class ChatModule { }
