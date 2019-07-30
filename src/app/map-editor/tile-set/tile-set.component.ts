import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from 'src/app/ws.service';

export const TileTypes = [
  'Head',
  'Middle Egg', 'Right Egg',
  'Left Pod', 'Middle Pod',
  'Left Locker', 'Right Locker',
  'Left Cuttle', 'Right Cuttle',
  'Left Obstacle', 'Middle Obstacle', 'Right Obstacle'
];

@Component({
  selector: 'app-tile-set',
  templateUrl: './tile-set.component.html',
  styleUrls: ['./tile-set.component.css']
})
export class TileSetComponent implements OnInit, OnDestroy {
  @Input() map: any;
  @Input() changeTile: () => void;

  private sub: Subscription;

  types = TileTypes;
  error = '';
  success = '';
  pending = false;
  activeType = 0;

  constructor(private ws: WsService) { }

  ngOnInit() {
    this.sub = this.ws.subscribe('savedWeight', () => this.pending = false);
    this.sub = this.ws.subscribe('deletedMap', m => this.handleDelete(m));
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private handleDelete(msg: any) {
    this.pending = false;
    this.map.tiles[msg.type] = this.map.tiles[msg.type].filter(tile => {
      return tile.id !== msg.id;
    });
    this.map.selectedTile = {};
  }

  select(tile) {
    this.map.selectedTile = tile;
    this.changeTile();
  }

  newTile() {
    this.map.selectedTile = {
      group: 'tiles',
      type: this.map.selectedTile.type || 0,
      tile_set: this.map.tileSet.id
    };
    this.map.settingsOpen = true;
  }

  editTile() {
    this.map.selectedTile.group = 'tiles';
    this.map.settingsOpen = true;
  }

  saveWeight(tile: any) {
    this.pending = true;
    const map = {
      group: 'tiles',
      weight: tile.weight,
      id: tile.id
    };
    this.ws.send('saveWeight', map);
  }

  deleteTile(tile: any) {
    if (!confirm(`Delete tile '${tile.name}'? this cannot be undone.`)) return;
    this.pending = true;
    const map = {
      group: 'tiles',
      type: tile.type,
      id: tile.id
    };
    this.ws.send('deleteMap', map);
  }

}
