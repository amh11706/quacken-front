import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
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
  quantity = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Item) {
    this.quantity = Math.round(data.q / 2);
  }
}
