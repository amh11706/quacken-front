import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QdragModule } from '../../../qdrag/qdrag.module';
import { CanvasComponent } from './canvas.component';
import { SpriteImageModule } from '../twod-render/sprite-img/sprite-img.module';

@NgModule({
  declarations: [CanvasComponent],
  imports: [
    QdragModule,
    CommonModule,
    SpriteImageModule,
  ],
  exports: [CanvasComponent],
})
export class CanvasModule { }
