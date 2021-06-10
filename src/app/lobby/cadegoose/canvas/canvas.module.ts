import { NgModule } from '@angular/core';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { CommonModule } from '@angular/common';
import { CanvasComponent } from './canvas.component';
import { SpriteImageModule } from '../twod-render/sprite-img/sprite-img.module';

@NgModule({
  declarations: [CanvasComponent],
  imports: [
    QdragModule,
    CommonModule,
    SpriteImageModule
  ],
  exports: [CanvasComponent],
})
export class CanvasModule { }
