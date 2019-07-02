import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QdragDirective } from './qdrag.directive';

@NgModule({
  declarations: [QdragDirective],
  imports: [
    CommonModule
  ],
  exports: [QdragDirective]
})
export class QdragModule { }
