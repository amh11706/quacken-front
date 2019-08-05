import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { Item } from '../inventory.component';

@Component({
  selector: 'app-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.css']
})
export class SplitComponent implements OnInit {
  quantity: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Item) {
    this.quantity = Math.round(data.q / 2);
  }

  ngOnInit() {
  }

}
