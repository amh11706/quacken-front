import { NgModule } from '@angular/core';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { GuBoatsComponent } from './gu-boats/gu-boats.component';
import { GuBoatImgComponent } from './gu-boats/gu-boat-img/gu-boat-img.component';
import { TwodRenderComponent } from './twod-render.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [TwodRenderComponent, GuBoatsComponent,GuBoatImgComponent],
  imports: [
    QdragModule,
    CommonModule,
  ],
  exports: [TwodRenderComponent, GuBoatsComponent,GuBoatImgComponent],
})
export class TwodRenderModule { }
