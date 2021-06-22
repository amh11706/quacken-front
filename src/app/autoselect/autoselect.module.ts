import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoSelectDirective } from './autoselect.directive';

@NgModule({
  declarations: [AutoSelectDirective],
  imports: [
    CommonModule,
  ],
  exports: [AutoSelectDirective],
})
export class AutoSelectModule { }
