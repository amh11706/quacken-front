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

  protected initTile(tile: DBTile) {
    if (this.map?.tmaps) tile = this.map.tmaps.find(el => el.id === tile.id) || tile;
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
    super.select(tile);
  }

}
