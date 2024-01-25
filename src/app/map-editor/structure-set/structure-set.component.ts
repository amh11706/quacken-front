import { Component, OnInit, OnDestroy } from '@angular/core';

import { TileSetComponent } from '../tile-set/tile-set.component';
import { DBTile } from '../map-editor.component';

@Component({
  selector: 'q-structure-set',
  templateUrl: './structure-set.component.html',
  styleUrls: ['./structure-set.component.scss'],
})
export class StructureSetComponent extends TileSetComponent implements OnInit, OnDestroy {
  protected group: 'tile' | 'structure' = 'structure';
  groups = ['Tiles', 'Obstacle Zones', 'Wing Zones'];

  protected initTile(tile: DBTile): void {
    if (this.map?.structures) tile = this.map.structures.find(el => el.id === tile.id) || tile;
    this.select(tile);
  }

  protected handleDelete = (msg: DBTile): void => {
    this.pending = false;
    if (!this.map?.structures) return;
    this.map.structures = this.map.structures.filter(structure => {
      return structure.id !== msg.id;
    });
    this.map.selectedTile = this.map.structures[0] || { id: null, name: '', undos: [], redos: [] } as unknown as DBTile;
  };

  newFeature(): void {
    if (!this.map) return;
    const feature = { group: 0, x1: 0, y1: 0, x2: 7, y2: 7, type: 0, density: 1 };
    this.map.selectedTile.data?.push(feature);
    this.map.selectedTile.activeFeature = feature;
  }

  deleteFeature(): void {
    if (!this.map) return;
    if (!window.confirm('Are you sure you want to delete this feature? It will not be fully removed until you hit save.')) {
      return;
    }
    const feature = this.map.selectedTile.activeFeature;
    if (!this.map.structures) return;
    this.map.selectedTile.data = this.map.selectedTile.data?.filter(f => {
      return f !== feature;
    });
    this.map.selectedTile.unsaved = true;
  }

  updatePosition(e: Event, which: 'x1' | 'x2' | 'y1' | 'y2'): void {
    if (!this.map || !(e.target instanceof HTMLInputElement)) return;
    this.map.selectedTile.unsaved = true;
    const feature = this.map.selectedTile.activeFeature;
    if (!feature) return;
    feature[which] = +e.target.value;

    if (feature.group !== 0) {
      switch (which) {
        case 'x1':
          if (feature.x2 < feature.x1) feature.x2 = feature.x1;
          return;
        case 'y1':
          if (feature.y2 < feature.y1) feature.y2 = feature.y1;
          return;
        case 'x2':
          if (feature.x2 < feature.x1) feature.x1 = feature.x2;
          return;
        case 'y2':
          if (feature.y2 < feature.y1) feature.y1 = feature.y2;
          break;
        default:
      }
    } else {
      switch (which) {
        case 'x1':
          feature.x2 = +feature.x1 + 7;
          return;
        case 'y1':
          feature.y2 = +feature.y1 + 7;
          return;
        case 'x2':
          feature.x1 = +feature.x2 - 7;
          return;
        case 'y2':
          feature.y1 = +feature.y2 - 7;
          break;
        default:
      }
    }
  }
}
