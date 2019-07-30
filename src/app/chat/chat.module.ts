import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule } from '@angular/material';

import { NameModule } from './name/name.module';
import { ChatComponent } from './chat.component';
import { ChatService } from './chat.service';
import { StatComponent } from './stat/stat.component';
import { StatService } from './stat/stat.service';
import { QdragModule } from '../qdrag/qdrag.module';
import { LeadersComponent } from './leaders/leaders.component';

@NgModule({
  declarations: [ChatComponent, StatComponent, LeadersComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    NameModule,
    QdragModule,
  ],
  providers: [ChatService, StatService],
  exports: [ChatComponent, StatComponent, LeadersComponent]
})
export class ChatModule { }
