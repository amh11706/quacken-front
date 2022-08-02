import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingComponent } from './training.component';
import { QdragModule } from '../qdrag/qdrag.module';
import { TrainingRoutingModule } from './training-routing.module';
import { TwodRenderModule } from '../lobby/cadegoose/twod-render/twod-render.module';

@NgModule({
  declarations: [
    TrainingComponent,
  ],
  imports: [
    TrainingRoutingModule,
    CommonModule,
    QdragModule,
    TwodRenderModule,
  ],
})
export class TrainingModule { }
