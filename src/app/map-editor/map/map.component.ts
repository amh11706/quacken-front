import { Component, OnInit, Input } from '@angular/core';

import { Titles } from '../obstacles/obstacles.component';
import { MapEditor, MapTile } from '../map-editor.component';

const MAX_UNDOS = 100;

export class Pos {
  static dx = [0, 1, 0, -1];
  static dy = [-1, 0, 1, 0];

  constructor(public x: number, public y: number) { }

  move(dir: number) {
    this.x += Pos.dx[dir];
    this.y += Pos.dy[dir];
  }
}

@Component({
  selector: 'q-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() map?: MapEditor;
  @Input() undo?: (source: MapTile[][], target: MapTile[][]) => void;
  @Input() setTile?: (x: number, y: number, v: number) => MapTile | undefined;
  titles = Titles;

  painting = false;
  private clickX?: number;
  private clickY?: number;

  constructor() { }

  ngOnInit() {
  }

  clickTile(e: MouseEvent, x: number, y: number) {
    if (!this.map || !this.setTile) return;
    const tile = this.map.selectedTile;
    if (!tile.data) return;
    if (this.painting && e.buttons === 1 && tile.data[y][x]) return;
    if (e.shiftKey) {
      this.map.selected = tile.data[y][x] || this.map.selected;
      return;
    }
    if (e.ctrlKey) this.painting = true;
    if (!e.ctrlKey) {
      this.clickX = e.clientX;
      this.clickY = e.clientY;
      return;
    }

    const newValue = e.buttons === 1 ? this.map.selected : 0;
    const change = this.setTile(x, y, newValue);
    if (!change) {
      if (newValue < 17 && newValue > 8) this.finishWhirl(x, y, []);
      return;
    }

    tile.redos = [];
    const sides = 4;
    if (newValue < 5 + sides * 3 && newValue > 4 + sides) this.finishWhirl(x, y, [change]);
    else tile.undos.push([change]);
    if (tile.undos.length > MAX_UNDOS) tile.undos = tile.undos.slice(-MAX_UNDOS);
  }

  mouseUp(e: MouseEvent, x: number, y: number) {
    if (!this.clickX || !this.clickY || !this.setTile || !this.map) return;
    if (Math.abs(e.clientX - this.clickX) + Math.abs(e.clientY - this.clickY) > 5) return;
    this.clickX = 0;
    this.clickY = 0;

    const newValue = e.button !== 2 ? this.map.selected : 0;
    const change = this.setTile(x, y, newValue);
    if (!change) return;

    const tile = this.map.selectedTile;
    tile.undos.push([change]);
    tile.redos = [];
    if (tile.undos.length > MAX_UNDOS) tile.undos = tile.undos.slice(-MAX_UNDOS);
  }

  private finishWhirl(x: number, y: number, changes: MapTile[]) {
    if (!this.setTile || !this.map) return;
    this.painting = false;
    const sides = 4;
    let tile = (this.map.selected - 5) % sides;
    const inverted = this.map.selected > 4 + 2 * sides ? sides : 0;
    const p = new Pos(x, y);

    const sTile = this.map.selectedTile;
    if (!sTile.data) return;
    for (let i = 1; i < sides; i++) {
      p.move(tile);
      if (inverted) tile = (tile + sides - 1) % sides;
      else tile = (tile + 1) % sides;

      if (sTile.data[p.y] && sTile.data[p.y][p.x] === 0) {
        const change = this.setTile(p.x, p.y, tile + 5 + sides + inverted);
        if (change) changes.push(change);
      }
    }

    if (changes.length) {
      sTile.undos.push(changes);
      sTile.redos = [];
    }
  }

}
