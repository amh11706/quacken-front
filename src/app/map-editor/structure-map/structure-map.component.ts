import { Component, OnInit, Input } from '@angular/core';

import { TileTypes } from '../tile-set/tile-set.component';

@Component({
  selector: 'app-structure-map',
  templateUrl: './structure-map.component.html',
  styleUrls: ['./structure-map.component.css']
})
export class StructureMapComponent implements OnInit {
  @Input() map: any;
  @Input() left: number;
  @Input() right: number;
  types = TileTypes;
  groups = ['', 'Obstacle Zone: ', 'Wing Zone: '];

  rows: number[] = [];
  columns: number[] = [];

  constructor() { }

  ngOnInit() {
    for (let x = 0; x < 25; x++) this.columns.push(x);
    for (let y = 0; y < 52; y++) this.rows.push(y);
  }

}
