import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
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
  ],
})
export class MoveSourceModule { }
