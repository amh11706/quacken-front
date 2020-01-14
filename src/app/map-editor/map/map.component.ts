import { Component, OnInit, Input } from '@angular/core';

import { Titles } from '../obstacles/obstacles.component';
import { MapEditor, MapTile } from '../map-editor.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() map: MapEditor;
  @Input() undo: (source: MapTile[][], target: MapTile[][]) => void;
  @Input() setTile: (x: number, y: number, v: number) => MapTile;
  titles = Titles;

  painting = false;
  private clickX: number;
  private clickY: number;

  constructor() { }

  ngOnInit() {
  }

  clickTile(e: MouseEvent, x: number, y: number) {
    const tile = this.map.selectedTile;
    if (this.painting && e.which === 1 && tile.data[y][x]) return;
    if (e.shiftKey) {
      this.map.selected = tile.data[y][x] || this.map.selected;
      return;
    }
    this.painting = e.ctrlKey;
    if (!e.ctrlKey) {
      this.clickX = e.clientX;
      this.clickY = e.clientY;
      return;
    }

    const newValue = e.which === 1 ? this.map.selected : 0;
    const change = this.setTile(x, y, newValue);
    if (!change) {
      if (newValue < 17 && newValue > 8) this.finishWhirl(x, y, []);
      return;
    }

    tile.redos = [];
    if (newValue < 17 && newValue > 8) this.finishWhirl(x, y, [change]);
    else tile.undos.push([change]);
    if (tile.undos.length > 20) tile.undos = tile.undos.slice(-20);
  }

  mouseUp(e: MouseEvent, x: number, y: number) {
    if (Math.abs(e.clientX - this.clickX) + Math.abs(e.clientY - this.clickY) > 20) return;
    this.clickX = 0;
    this.clickY = 0;

    const newValue = e.which === 1 ? this.map.selected : 0;
    const change = this.setTile(x, y, newValue);
    if (!change) return;

    const tile = this.map.selectedTile;
    tile.undos.push([change]);
    tile.redos = [];
    if (tile.undos.length > 20) tile.undos = tile.undos.slice(-20);
  }

  private finishWhirl(x: number, y: number, changes: any[]) {
    this.painting = false;
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];
    let tile = (this.map.selected - 1) % 4;
    const inverted = this.map.selected > 12 ? 4 : 0;

    const sTile = this.map.selectedTile;
    for (let i = 0; i < 3; i++) {
      x += dx[tile];
      y += dy[tile];
      if (inverted) tile = (tile + 3) % 4;
      else tile = (tile + 1) % 4;

      if (sTile.data[y] && sTile.data[y][x] === 0) {
        const change = this.setTile(x, y, tile + 9 + inverted);
        if (change) changes.push(change);
      }
    }

    if (changes.length) {
      sTile.undos.push(changes);
      sTile.redos = [];
    }
  }

}
