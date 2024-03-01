import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MoveSourceComponent } from './move-source.component';

@NgModule({
  declarations: [
    MoveSourceComponent,
  ],
  exports: [
    MoveSourceComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
})
export class MoveSourceModule { }
