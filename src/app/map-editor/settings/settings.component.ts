import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Input() map: any;
  groups = {
    maps: 'Map',
    tile_sets: 'Tile Set',
    structure_sets: 'Structure Set',
    cgmaps: 'Map'
  };
  types = [
    'Head',
    'Middle Egg', 'Right Egg',
    'Left Pod', 'Middle Pod', 'Right Pod',
    'Left Locker', 'Right Locker',
    'Left Cuttle', 'Right Cuttle',
    'Middle Obstacle', 'Right Obstacle'
  ];
  selected = 'new';
  options = [];
  private sub: Subscription;
  private mapData: any = {};

  error = '';
  success = '';
  pending = false;

  constructor(private socket: WsService) { }

  ngOnInit() {
    if (!['tiles', 'structures'].includes(this.map.selectedTile.group)) this.socket.send('getMaps');
    this.handleSubs();
    this.selected = this.map.selectedTile.id || 'new';
    if (this.map.selectedTile.unsaved) this.error = 'Unsaved changes! They will be discarded if you select a different map without saving.';
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private handleSubs() {
    this.sub = this.socket.subscribe('getTileSet', ts => this.handleTileSet(ts));
    this.sub.add(this.socket.subscribe('getStructureSet', ss => this.handleStructureSet(ss)));
    this.sub.add(this.socket.subscribe('createMap', m => this.handleMap(m)));
    this.sub.add(this.socket.subscribe('saveMap', m => this.handleMap(m)));
    this.sub.add(this.socket.subscribe('getMap', m => this.gotMap(m)));
    this.sub.add(this.socket.subscribe('mapList', l => this.gotList(l)));

    // if (tile.id || tile.group === 'structures') return;
    //
    // this.map.selectedTile = msg.structure_sets[0];
    // this.map.selectedTile.group = 'structure_sets';
    // this.edit();
  }

  private gotList(list: any) {
    this.mapData = list;
    const tile = this.map.selectedTile;
    this.options = list[tile.group];
  }

  private handleTileSet(tileSet: any) {
    const tiles = [];
    this.map.tiles = tiles;
    this.map.tileSet = this.map.selectedTile;
    this.map.tileSet.data = [[]];
    this.map.settingsOpen = false;

    for (let tile of tileSet) {
      tile.data = JSON.parse(tile.data);
      if (!tiles[tile.type]) tiles[tile.type] = [tile];
      else tiles[tile.type].push(tile);
    }
    this.map.selectedTile = tileSet[0] || {};
  }

  private handleStructureSet(structureSet: any) {
    this.map.structures = structureSet;
    this.map.structureSet = this.map.selectedTile;
    this.map.structureSet.data = [[]];
    this.map.selectedTile = structureSet[0] || {};
    this.map.settingsOpen = false;

    for (let structure of structureSet) {
      structure.data = JSON.parse(structure.data);
    }
  }

  private gotMap(map: any) {
    const tile = this.map.selectedTile;
    if (!['tiles', 'structures'].includes(tile.group)) {
      this.map.tiles = null;
      this.map.tileSet = null;
    }
    if (map.data) tile.data = JSON.parse(map.data);
    this.map.settingsOpen = false;
  }

  private handleMap(msg: any) {
    this.pending = false;
    this.error = msg.error;
    if (this.error) return;

    const tile = this.map.selectedTile;
    if (['tiles', 'structures'].includes(tile.group)) {
      if (msg.id) {
        if (tile.group === 'tiles') {
          const tiles = this.map.tiles;
          if (!tiles[msg.type]) tiles[msg.type] = [tile];
          else tiles[msg.type].push(tile);
        } else {
          if (!this.map.structures) this.map.structures = [tile];
          else this.map.structures.push(tile);
        }
        tile.id = msg.id;
      }

      this.map.settingsOpen = false;
      return;
    }

    if (msg) {
      console.log(msg)
      this.mapData[msg.group].push(msg);
      tile.id = msg.id;
      this.selected = tile.id;
      this.success = this.groups[tile.group] + ' Created!';
      return;
    }

    const selected = this.options.find(option => option.id === +this.selected) || {};
    selected.name = tile.name;
    selected.description = tile.description;
    selected.id = tile.id;
    selected.released = tile.released;
  }

  select() {
    this.error = '';
    this.success = '';
    const tile = this.map.selectedTile;
    tile.unsaved = false;

    const selected = this.options.find(option => option.id === +this.selected) || {};
    tile.name = selected.name;
    tile.description = selected.description;
    tile.id = selected.id;
    tile.released = selected.released;
  }

  updateOptions() {
    this.options = this.mapData[this.map.selectedTile.group];
    this.selected = 'new';
    this.select();
  }

  private buildMap(type: string): number[][] {
    const types = {
      cgmaps: { x: 20, y: 36 },
      maps: { x: 25, y: 52 },
      tiles: { x: 8, y: 8 }
    };

    const size = types[type];
    if (!size) return [];
    const map = [];

    for (let y = 0; y < size.y; y++) {
      const row = [];
      for (let x = 0; x < size.x; x++) row.push(0);
      map.push(row);
    }

    return map;
  }

  save() {
    this.success = '';
    const tile = this.map.selectedTile;
    this.error = tile.name ? '' : 'Name is required.';
    if (this.error) return;

    if (this.selected === 'new') {
      tile.data = this.buildMap(tile.group);
      tile.weight = 1;
    }

    this.pending = true;
    const cmd = this.selected === 'new' ? 'createMap' : 'saveMap';
    const newTile: any = {};
    Object.assign(newTile, tile);
    if (this.selected !== 'new' && !tile.unsaved) delete newTile.data;
    else newTile.data = JSON.stringify(tile.data);
    this.socket.send(cmd, newTile);
  }

  edit() {
    this.pending = true;
    const tile = this.map.selectedTile;
    switch (tile.group) {
      case 'tile_sets': return this.socket.send('getTileSet', tile.id);
      case 'structure_sets': return this.socket.send('getStructureSet', tile.id);
      default: this.socket.send('getMap', { group: tile.group, tile: tile.id });
    }
  }

}
