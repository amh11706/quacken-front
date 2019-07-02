import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ChatComponent } from './chat.component';
import { NameComponent } from './name/name.component';
import { ChatService } from './chat.service';

@NgModule({
  declarations: [ChatComponent, NameComponent],
  imports: [
    CommonModule,
    FormsModule,
  ],
  providers: [ChatService],
  exports: [ChatComponent]
})
export class ChatModule { }
