import { Component } from '@angular/core';
import { DBTile } from '../map-editor.component';
import { TileSetComponent } from '../tile-set/tile-set.component';

@Component({
  selector: 'q-tmap-set',
  templateUrl: './tmap-set.component.html',
  styleUrls: ['./tmap-set.component.scss']
})
export class TmapSetComponent extends TileSetComponent {
  protected group: 'tile' | 'structure' | 'tmap' = 'tmap';
  winConditions: { id: number, value: number, type: number }[] = [];
  conditions = [
    { name: 'Kills', id: 0 },
    { name: 'Shots Hit', id: 3 },
    { name: 'Shots Fired', id: 4 },
    { name: 'Shots Taken', id: 5 },
    { name: 'Flag Points', id: 7 },
    { name: 'Max Turns', id: 99 },
    { name: 'Cuttle Cake', id: 100 },
    { name: 'Taco Locker', id: 101 },
    { name: 'Pea Pod', id: 102 },
    { name: 'Fried Egg', id: 103 },
    { name: 'Bomb Duck', id: 104 },
    { name: 'Bomb Head', id: 105 },
  ];
  types = ['>', '<', '='];

  protected initTile(tile: DBTile) {
    if (this.map?.tmaps) tile = this.map.tmaps.find(el => el.id === tile.id) || tile;
    if (!tile.settings) tile.settings = {};
    this.winConditions = tile.settings.winConditions || [];
    tile.settings.winConditions = this.winConditions;
    this.select(tile);
  }

  protected handleDelete = (msg: any) => {
    this.pending = false;
    if (!this.map?.tmaps) return;
    this.map.tmaps = this.map.tmaps.filter(map => {
      return map.id !== msg.id;
    });
    this.map.selectedTile = this.map.tmaps[0] || { id: null, name: '', undos: [], redos: [] };
  }

  select(tile: DBTile) {
    if (!tile.settings) tile.settings = {};
    this.winConditions = tile.settings.winConditions || [];
    tile.settings.winConditions = this.winConditions;
    super.select(tile);
  }

  addCondition() {
    this.winConditions.push({ id: this.conditions[0].id, value: 0, type: 0 });
    if (this.map) this.map.selectedTile.unsaved = true;
  }

  removeCondition(i: number) {
    if (this.winConditions.length === 1) this.winConditions = [];
    else this.winConditions = this.winConditions.splice(i - 1, 1);
    if (this.map) this.map.selectedTile.unsaved = true;
  }

}
