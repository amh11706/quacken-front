import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { Item } from '../inventory.component';

@Component({
  selector: 'q-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.css'],
})
export class SplitComponent {
  quantity = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Item) {
    this.quantity = Math.round(data.q / 2);
  }
}
