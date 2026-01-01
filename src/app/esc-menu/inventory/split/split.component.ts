import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from '../../profile/types';

@Component({
  selector: 'q-split',
  templateUrl: './split.component.html',
  styleUrl: './split.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SplitComponent {
  data = inject<Item>(MAT_DIALOG_DATA);

  quantity = 0;

  constructor() {
    const data = this.data;

    this.quantity = Math.round(data.q / 2);
  }
}
