import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { InputComponent } from './input/input.component';
import { NameSearchComponent } from './name-search/name-search.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  declarations: [ChatComponent, CommandsComponent, InputComponent, NameSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatTooltipModule,
    NgSelectModule,
    NameModule,
    QdragModule,
    ScrollingModule,
  ],
  exports: [ChatComponent, NameSearchComponent],
})
export class ChatModule { }
