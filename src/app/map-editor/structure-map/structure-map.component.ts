import { Component, OnInit, Input } from '@angular/core';

import { TileTypes } from '../tile-set/tile-set.component';
import { MapEditor } from '../types';

@Component({
  selector: 'q-structure-map',
  templateUrl: './structure-map.component.html',
  styleUrls: ['./structure-map.component.css'],
  standalone: false,
})
export class StructureMapComponent implements OnInit {
  @Input() map?: MapEditor;
  types = TileTypes;
  groups = ['', 'Obstacle Zone: ', 'Wing Zone: '];

  rows: number[] = [];
  columns: number[] = [];

  ngOnInit(): void {
    for (let x = 0; x < 25; x++) this.columns.push(x);
    for (let y = 0; y < 52; y++) this.rows.push(y);
  }
}
