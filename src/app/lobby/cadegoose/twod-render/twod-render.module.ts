import { NgModule } from '@angular/core';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { GuBoatsComponent } from './gu-boats/gu-boats.component';
import { SpriteImgComponent } from './sprite-img/sprite-img.component';
import { TwodRenderComponent } from './twod-render.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [TwodRenderComponent, GuBoatsComponent, SpriteImgComponent],
  imports: [
    QdragModule,
    CommonModule,
  ],
  exports: [TwodRenderComponent, GuBoatsComponent, SpriteImgComponent],
})
export class TwodRenderModule { }
