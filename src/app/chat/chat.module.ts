import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NameModule } from './name/name.module';
import { ChatComponent } from './chat.component';
import { QdragModule } from '../qdrag/qdrag.module';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommandsComponent } from './commands/commands.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [ChatComponent, CommandsComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    NameModule,
    QdragModule,
    ScrollingModule,
  ],
  exports: [ChatComponent]
})
export class ChatModule { }
