import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { NameSearchComponent } from './name-search/name-search.component';
import { InputComponent } from './input/input.component';
import { QdragModule } from '../qdrag/qdrag.module';
import { ChatComponent } from './chat.component';
import { NameModule } from './name/name.module';
import { EmojiInputDirective } from './input/emoji-input.directive';

@NgModule({
  declarations: [ChatComponent, InputComponent, NameSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatInputModule,
    MatSelectModule,
    NameModule,
    QdragModule,
    ScrollingModule,
    EmojiInputDirective,
  ],
  exports: [ChatComponent, NameSearchComponent],
})
export class ChatModule { }
