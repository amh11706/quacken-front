import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';

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
