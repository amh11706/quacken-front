import { NgModule } from '@angular/core';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { GuBoatsComponent } from './gu-boats/gu-boats.component';
import { TwodRenderComponent } from './twod-render.component';
import { CommonModule } from '@angular/common';
import { SpriteImageModule } from './sprite-img/sprite-img.module';

@NgModule({
  declarations: [TwodRenderComponent, GuBoatsComponent],
  imports: [
    QdragModule,
    CommonModule,
    SpriteImageModule,
  ],
  exports: [TwodRenderComponent, GuBoatsComponent],
})
export class TwodRenderModule { }
