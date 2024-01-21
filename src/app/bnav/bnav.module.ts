import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { BnavRoutingModule } from './bnav-routing.module';
import { BnavComponent } from './bnav.component';
import { ChatModule } from '../chat/chat.module';
import { QdragModule } from '../qdrag/qdrag.module';
import { BnavMapComponent } from './bnav-map/bnav-map.component';
import { QuackenModule } from '../lobby/quacken/quacken.module';

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
  ],
})
export class BnavModule { }
