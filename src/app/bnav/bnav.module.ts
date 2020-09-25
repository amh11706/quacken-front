import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BnavRoutingModule } from './bnav-routing.module';
import { BnavComponent } from './bnav.component';
import { ChatModule } from '../chat/chat.module';
import { QdragModule } from '../qdrag/qdrag.module';
import { BnavMapComponent } from './bnav-map/bnav-map.component';
import { QuackenModule } from '../lobby/quacken/quacken.module';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [BnavComponent, BnavMapComponent],
  imports: [
    CommonModule,
    FormsModule,
    BnavRoutingModule,
    ChatModule,
    QdragModule,
    QuackenModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ]
})
export class BnavModule { }