import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NameModule } from './name/name.module';
import { ChatComponent } from './chat.component';
import { StatComponent } from './stat/stat.component';
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
  exports: [ChatComponent, StatComponent, LeadersComponent]
})
export class ChatModule { }
