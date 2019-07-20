import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from 'src/app/ws.service';
import { TileTypes } from '../tile-set/tile-set.component';

@Component({
  selector: 'app-structure-set',
  templateUrl: './structure-set.component.html',
  styleUrls: ['./structure-set.component.css']
})
export class StructureSetComponent implements OnInit, OnDestroy {
  @Input() map: any;
  types = TileTypes;
  groups = ['Tiles', 'Obstacle Zones', 'Wing Zones'];

  private sub: Subscription;

  error = '';
  success = '';
  pending = false;

  constructor(private ws: WsService) { }

  ngOnInit() {
    this.sub = this.ws.subscribe('savedWeight', () => this.pending = false);
    this.sub.add(this.ws.subscribe('deletedMap', m => this.handleDelete(m)));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private handleDelete(msg: any) {
    this.pending = false;
    this.map.structures = this.map.structures.filter(structure => {
      return structure.id !== msg.id;
    });
    this.map.selectedTile = {};
  }

  select(structure: any) {
    this.map.selectedTile = structure;
  }

  newFeature() {
    const feature = { group: 0, x1: 0, y1: 0, x2: 7, y2: 7, type: 0, density: 1 };
    this.map.selectedTile.data.push(feature);
    this.map.selectedTile.activeFeature = feature;
  }

  newStructure() {
    this.map.selectedTile = {
      group: 'structures',
      type: this.map.selectedTile.type || 0,
      structure_set: this.map.structureSet.id
    };
    this.map.settingsOpen = true;
  }

  editStructure() {
    this.map.selectedTile.group = 'structures';
    this.map.settingsOpen = true;
  }

  saveWeight(structure: any) {
    this.pending = true;
    const map = {
      group: 'structures',
      weight: structure.weight,
      id: structure.id
    };
    this.ws.send('saveWeight', map);
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

  deleteStructure(structure: any) {
    if (!confirm(`Delete structure '${structure.name}'? this cannot be undone.`)) return;
    this.pending = true;
    const map = {
      group: 'structures',
      type: structure.type,
      id: structure.id
    };
    this.ws.send('deleteMap', map);
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
