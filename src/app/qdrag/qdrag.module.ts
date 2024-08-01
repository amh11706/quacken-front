import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QdragDirective } from './qdrag.directive';
import { QzoomDirective } from './qzoom.directive';

@NgModule({
  declarations: [QdragDirective, QzoomDirective],
  imports: [
    CommonModule,
  ],
  exports: [QdragDirective, QzoomDirective],
})
export class QdragModule { }
