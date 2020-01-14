import { Component, OnInit, OnDestroy } from '@angular/core';

import { TileSetComponent } from '../tile-set/tile-set.component';
import { DBTile } from '../map-editor.component';

@Component({
  selector: 'app-structure-set',
  templateUrl: './structure-set.component.html',
  styleUrls: ['./structure-set.component.css']
})
export class StructureSetComponent extends TileSetComponent implements OnInit, OnDestroy {
  protected group = 'structure';
  groups = ['Tiles', 'Obstacle Zones', 'Wing Zones'];

  protected initTile(tile: DBTile) {
    tile = this.map.structures.find(el => el.id === tile.id);
    this.select(tile);
  }

  protected handleDelete = (msg: any) => {
    this.pending = false;
    this.map.structures = this.map.structures.filter(structure => {
      return structure.id !== msg.id;
    });
    this.map.selectedTile = this.map.structures[0] || { id: null, name: '', undos: [], redos: [] };
  }

  newFeature() {
    const feature = { group: 0, x1: 0, y1: 0, x2: 7, y2: 7, type: 0, density: 1 };
    this.map.selectedTile.data.push(feature);
    this.map.selectedTile.activeFeature = feature;
  }

  deleteFeature() {
    if (!confirm('Are you sure you want to delete this feature? It will not be fully removed until you hit save.')) {
      return;
    }
    const feature = this.map.selectedTile.activeFeature;
    this.map.selectedTile.data = this.map.selectedTile.data.filter(f => {
      return f !== feature;
    });
    this.map.selectedTile.unsaved = true;
  }

  updatePosition(e: any, which: string) {
    this.map.selectedTile.unsaved = true;
    const feature = this.map.selectedTile.activeFeature;
    feature[which] = +e.target.value;

    if (feature.group != 0) {
      switch (which) {
        case 'x1':
          if (feature.x2 < feature.x1) feature.x2 = feature.x1;
          break;
        case 'y1':
          if (feature.y2 < feature.y1) feature.y2 = feature.y1;
          break;
        case 'x2':
          if (feature.x2 < feature.x1) feature.x1 = feature.x2;
          break;
        case 'y2':
          if (feature.y2 < feature.y1) feature.y1 = feature.y2;
          break;
        default:
      }

    } else {
      switch (which) {
        case 'x1': return feature.x2 = +feature.x1 + 7;
        case 'y1': return feature.y2 = +feature.y1 + 7;
        case 'x2': return feature.x1 = +feature.x2 - 7;
        case 'y2': return feature.y1 = +feature.y2 - 7;
        default:
      }
    }
  }

}
