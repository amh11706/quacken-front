import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from 'src/app/ws.service';
import { DBTile, MapEditor, MapGroups } from '../map-editor.component';

export const TileTypes = [
  'Head',
  'Middle Egg', 'Right Egg',
  'Left Pod', 'Middle Pod',
  'Left Locker', 'Right Locker',
  'Left Cuttle', 'Right Cuttle',
  'Left Obstacle', 'Middle Obstacle', 'Right Obstacle'
];

@Component({
  selector: 'q-tile-set',
  templateUrl: './tile-set.component.html',
  styleUrls: ['./tile-set.component.css']
})
export class TileSetComponent implements OnInit, OnDestroy {
  @Input() map?: MapEditor;
  protected sub = new Subscription();
  protected group: 'tile' | 'structure' = 'tile';

  types = TileTypes;
  error = '';
  success = '';
  pending = false;

  constructor(protected ws: WsService) { }

  ngOnInit() {
    this.sub.add(this.ws.subscribe('savedWeight', () => this.pending = false));
    this.sub.add(this.ws.subscribe('deletedMap', this.handleDelete));
    if (this.map) this.initTile(this.map.selectedTile);
  }

  protected initTile(tile: DBTile) {
    if (!this.map?.tiles) return;
    const group = this.map.tiles[tile.type];
    if (!group) return;
    tile = group.find(el => el.id === tile.id) || tile;
    this.select(tile);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  protected handleDelete = (msg: any) => {
    if (!this.map?.tiles) return;
    this.pending = false;
    this.map.tiles[msg.type] = this.map.tiles[msg.type].filter((tile: DBTile) => {
      return tile.id !== msg.id;
    });
    this.map.selectedTile = { id: 0, group: 'maps', type: 0, name: '', undos: [], redos: [] };
  }

  select(tile: DBTile) {
    if (!this.map) return;
    if (this.map.tileSet) this.map.tileSet.activeGroup = tile.type;
    tile.undos = tile.undos || [];
    tile.redos = tile.redos || [];
    this.map.selectedTile = tile;
  }

  newTile() {
    if (!this.map) return;
    this.map.selectedTile = {
      id: 0, name: '', group: 'maps',
      undos: [], redos: [],
      type: this.map.selectedTile.type || 0,
      structure_set: this.map.structureSet?.id,
      tile_set: this.map.tileSet?.id,
    };
    this.editTile();
  }

  editTile() {
    const groups: { [key: string]: MapGroups } = { tile: 'tiles', structure: 'structures' };
    if (!this.map?.selectedTile) return;
    this.map.selectedTile.group = groups[this.group];
    this.map.settingsOpen = true;
    this.map.tileSettings = true;
  }

  saveWeight(tile: DBTile) {
    this.pending = true;
    const map = {
      group: this.group + 's',
      weight: tile.weight,
      id: tile.id
    };
    this.ws.send('saveWeight', map);
  }

  deleteTile(tile: DBTile) {
    if (!confirm(`Delete ${this.group} '${tile.name}'? this cannot be undone.`)) return;
    this.pending = true;
    const map = {
      group: this.group + 's',
      type: tile.type,
      id: tile.id
    };
    this.ws.send('deleteMap', map);
  }

}
