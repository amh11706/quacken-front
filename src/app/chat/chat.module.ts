import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { NameSearchComponent } from './name-search/name-search.component';
import { InputComponent } from './input/input.component';
import { QdragModule } from '../qdrag/qdrag.module';
import { ChatComponent } from './chat.component';
import { NameModule } from './name/name.module';

@NgModule({
  declarations: [ChatComponent, InputComponent, NameSearchComponent],
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
