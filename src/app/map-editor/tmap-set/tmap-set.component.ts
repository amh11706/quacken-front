import { Component } from '@angular/core';
import { TileSetComponent } from '../tile-set/tile-set.component';
import { DBTile } from '../types';

@Component({
    selector: 'q-tmap-set',
    templateUrl: './tmap-set.component.html',
    styleUrls: ['./tmap-set.component.scss'],
    standalone: false
})
export class TmapSetComponent extends TileSetComponent {
  protected group: 'tile' | 'structure' | 'tmap' = 'tmap';

  protected initTile(tile: DBTile): void {
    if (this.map?.tmaps) tile = this.map.tmaps.find(el => el.id === tile.id) || tile;
    this.select(tile);
  }

  protected handleDelete = (msg: DBTile): void => {
    this.pending = false;
    if (!this.map?.tmaps) return;
    this.map.tmaps = this.map.tmaps.filter(map => {
      return map.id !== msg.id;
    });
    this.map.selectedTile = this.map.tmaps[0] || { id: null, name: '', undos: [], redos: [] } as unknown as DBTile;
  };

  select(tile: DBTile): void {
    if (!tile.settings) tile.settings = {};
    super.select(tile);
  }
}
