import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatButtonModule, MatSliderModule } from '@angular/material';
import { QdragModule } from '../qdrag/qdrag.module';

import { InventoryComponent } from './inventory.component';
import { InventoryService } from './inventory.service';
import { SplitComponent } from './split/split.component';

@NgModule({
  declarations: [InventoryComponent, SplitComponent],
  entryComponents: [SplitComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    MatSliderModule,
    QdragModule,
  ],
  providers: [InventoryService],
  exports: [InventoryComponent]
})
export class InventoryModule { }
