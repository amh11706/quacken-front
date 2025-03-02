/* eslint-disable no-case-declarations */
import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { TagsComponent } from '../tags/tags.component';
import { MapEditor, DBTile, MapGroups } from '../types';

@Component({
    selector: 'q-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: false
})
export class SettingsComponent implements OnInit, OnDestroy {
  @ViewChild(TagsComponent) tags!: TagsComponent;
  @Input() map: MapEditor = {
    selected: 50,
    selectedTile: {
      undos: [],
      redos: [],
      id: 0,
      type: 0,
      name: '',
      group: 'tile_sets',
      data: [],
      tags: [],
    },
    settingsOpen: true,
  };

  groups = {
    maps: 'Map',
    tile_sets: 'Tile Set',
    tmap_sets: 'Challenge Set',
    structure_sets: 'Structure Set',
    cgmaps: 'Map',
    fgmaps: 'Flag Capture Map',
  };

  types = [
    'Head',
    'Middle Egg', 'Right Egg',
    'Left Pod', 'Middle Pod', 'Right Pod',
    'Left Locker', 'Right Locker',
    'Left Cuttle', 'Right Cuttle',
    'Middle Obstacle', 'Right Obstacle',
  ];

  selected: string | number = 'new';
  options: DBTile[] = [];
  private sub = new Subscription();
  public mapData: { [key: string]: DBTile[] } = {};

  error = '';
  success = '';
  pending = true;
  shown?: DBTile;

  constructor(protected socket: WsService) { }

  ngOnInit(): void {
    this.sub.add(this.socket.connected$.subscribe(v => {
      if (!v) return;
      setTimeout(async () => this.gotList(await this.socket.request(OutCmd.MapListAll)), 100);
    }));
    this.shown = this.map.selectedTile;
    if (!this.map.tileSettings) {
      this.shown = this.map.tileSet || this.map.structureSet || this.map.tmapSet || this.shown;
    }
    this.shown = { ...this.shown };
    this.selected = this.shown.id || 'new';

    let unsaved = this.shown.unsaved;
    if (!this.map.tileSettings) {
      switch (this.shown.group) {
        case 'tile_sets':
          if (this.map.tiles) {
            // prevent babel error with loop label
            // eslint-disable-next-line no-self-assign
            unsaved = unsaved;
            // eslint-disable-next-line no-labels
            tiles:
            for (const group of this.map.tiles) {
              if (group) {
                for (const tile of group) {
                  if (tile.unsaved) {
                    unsaved = true;
                    // eslint-disable-next-line no-labels
                    break tiles;
                  }
                }
              }
            }
          }
          break;
        case 'structure_sets':
          if (this.map.structures) {
            for (const structure of this.map.structures) {
              if (structure.unsaved) {
                unsaved = true;
                break;
              }
            }
          }
          break;
        case 'tmap_sets':
          if (this.map.tmaps) {
            for (const map of this.map.tmaps) {
              if (map.unsaved) {
                unsaved = true;
                break;
              }
            }
          }
          break;
        default:
      }
    }
    this.shown.unsaved = unsaved;
    if (unsaved) this.error = 'Unsaved changes! They will be discarded if you select a different map without saving.';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private gotList(list?: { [key: string]: DBTile[] }) {
    if (!list) return;
    this.mapData = list;
    const tile = this.shown;
    this.options = list[tile?.group ?? 'maps'] ?? this.options;
    if (tile && this.options) {
      for (const o of this.options) {
        o.group = tile.group;
        if (o.id === tile.id) {
          this.shown = { ...tile, ...o };
        }
      }
    }
    this.select();
  }

  private handleTileSet(tileSet?: DBTile[]) {
    delete this.map.structures;
    delete this.map.structureSet;
    delete this.map.tmaps;
    delete this.map.tmapSet;
    const tiles: DBTile[][] = [];
    this.map.tiles = tiles;
    this.map.tileSet = this.shown || this.map.selectedTile;
    this.map.tileSet.data = [[]];

    if (tileSet) {
      for (const t of tileSet) {
        if (!t.type) t.type = 0;
        if (!tiles[t.type]) tiles[t.type] = [t];
        else tiles[t.type]?.push(t);
      }
    }
    this.map.selectedTile = tileSet?.[0] || {
      id: null, name: '', undos: [], redos: [], tags: [],
    } as unknown as DBTile;
    const tile = this.map.selectedTile;
    tile.undos = tile.undos || [];
    tile.redos = tile.redos || [];
  }

  private handleStructureSet(structureSet?: DBTile[]) {
    delete this.map.tiles;
    delete this.map.tileSet;
    delete this.map.tmaps;
    delete this.map.tmapSet;
    this.map.structures = structureSet;
    this.map.structureSet = this.shown || this.map.selectedTile;
    this.map.structureSet.data = [[]];
    this.map.selectedTile = structureSet?.[0] || {
      id: null, name: '', undos: [], redos: [], tags: [],
    } as unknown as DBTile;
    const tile = this.map.selectedTile;
    tile.undos = tile.undos || [];
    tile.redos = tile.redos || [];
  }

  private handleTMapSet(tmaps?: DBTile[]) {
    delete this.map.tiles;
    delete this.map.tileSet;
    delete this.map.structures;
    delete this.map.structureSet;
    this.map.tmaps = tmaps;
    this.map.tmapSet = this.shown || this.map.selectedTile;
    this.map.tmapSet.data = [[]];
    this.map.selectedTile = tmaps?.[0] || {
      id: null, name: '', undos: [], redos: [], tags: [],
    } as unknown as DBTile;
    const tile = this.map.selectedTile;
    tile.undos = tile.undos || [];
    tile.redos = tile.redos || [];
  }

  // Fetched data
  private gotMap(map?: DBTile) {
    delete this.map.tiles;
    delete this.map.tileSet;
    delete this.map.structures;
    delete this.map.structureSet;
    delete this.map.tmaps;
    delete this.map.tmapSet;
    const tile = this.shown || this.map.selectedTile;
    tile.data = map?.data || tile.data;
    tile.undos = map?.undos || [];
    tile.redos = map?.redos || [];
    this.map.selectedTile = tile;
  }

  // Create or save
  private handleMap(msg?: DBTile) {
    this.pending = false;
    this.error = (msg && msg.error) || '';
    if (this.error) return;
    this.map.tileSettings = false;

    const tile = this.shown || this.map.selectedTile;
    tile.unsaved = false;
    if (msg) Object.assign(tile, msg);
    switch (tile.group) {
      case 'tiles':
        if (!this.map.tiles || !this.map.tileSet) return;
        const groups = this.map.tiles;
        const type = (tile.type) || 0;
        const tiles = groups[type] || [];
        groups[type] = tiles;

        const oldTile = tiles.find(el => el.id === tile.id);
        if (oldTile) Object.assign(oldTile, tile);
        else tiles.push(tile);
        this.map.selectedTile = oldTile || tile;
        this.map.tileSet.activeGroup = this.map.selectedTile.type;
        this.map.settingsOpen = false;
        return;
      case 'structures':
        const structures = this.map.structures || [];
        this.map.structures = structures;

        const oldStructure = structures.find(el => el.id === tile.id);
        if (oldStructure) Object.assign(oldStructure, tile);
        else this.map.structures.push(tile as any);
        this.map.selectedTile = oldStructure || tile;
        this.map.settingsOpen = false;
        return;
      case 'tmaps':
        const maps = this.map.tmaps || [];
        this.map.tmaps = maps;

        const oldMap = maps.find(el => el.id === tile.id);
        if (oldMap) Object.assign(oldMap, tile);
        else this.map.tmaps.push(tile as any);
        this.map.selectedTile = oldMap || tile;
        this.map.settingsOpen = false;
        return;
      case 'tile_sets':
        this.map.tileSet = tile;
        break;
      case 'structure_sets':
        this.map.structureSet = tile;
        break;
      case 'tmap_sets':
        this.map.tmapSet = tile;
        break;
      default:
    }

    if (msg) {
      this.mapData[msg.group]?.push(msg);
      tile.id = msg.id;
      this.selected = tile.id;
      this.success = this.groups[tile.group] + ' Created!';
      return;
    }

    const selected = this.options.find(option => option.id === +this.selected);
    if (selected) Object.assign(selected, tile);
  }

  select(): void {
    const tile = this.shown || this.map.selectedTile;
    const selected = this.options.find(option => option.id === +this.selected) || {
      id: null, name: '', undos: [], redos: [], tags: [], group: tile.group, data: [],
    };
    tile.unsaved = tile.id === selected.id && tile.group === selected.group && tile.unsaved;
    Object.assign(tile, selected);
    this.tags?.addAll(tile.tags);

    if (!tile.unsaved) {
      void this.fetchMap();
      this.error = '';
      this.success = '';
      delete this.map.tiles;
      delete this.map.structures;
      delete this.map.tmaps;
    } else {
      this.pending = false;
    }
  }

  updateOptions(): void {
    const tile = this.shown || this.map.selectedTile;
    this.options = this.mapData[tile.group] ?? this.options;
    this.selected = 'new';
    this.select();
  }

  private buildMap(type: MapGroups): number[][] {
    const types = {
      cgmaps: { x: 20, y: 36 },
      fgmaps: { x: 31, y: 41 },
      maps: { x: 25, y: 52 },
      tmaps: { x: 25, y: 52 },
      tiles: { x: 8, y: 8 },
      structure_sets: null,
      tile_sets: null,
      tmap_sets: null,
      structures: null,
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

  save(tile = this.shown || this.map.selectedTile): void {
    this.success = '';
    this.error = tile.name ? '' : 'Name is required.';
    tile.tags = this.tags.tags || [];
    if (this.error) return;

    if (this.selected === 'new') {
      tile.data = this.buildMap(tile.group);
      tile.weight = 1;
      if (tile.group === 'cgmaps') tile.rankArea = 2;
      else if (tile.group === 'fgmaps') tile.rankArea = 4;
    }

    if (tile.unsaved) {
      this.pending = true;
      const cmd = this.selected === 'new' ? OutCmd.MapCreate : OutCmd.MapSave;
      void this.socket.request(cmd, tile).then(m => this.handleMap(m));
    }

    switch (tile.group) {
      case 'tile_sets':
        if (this.map.tiles) {
          for (const group of this.map.tiles) {
            if (group) {
              for (const t of group) {
                t.group = 'tiles';
                if (t.unsaved) this.save(t);
                t.unsaved = false;
              }
            }
          }
        }
        break;
      case 'structure_sets':
        if (this.map.structures) {
          for (const structure of this.map.structures) {
            structure.group = 'structures';
            if (structure.unsaved) this.save(structure);
            structure.unsaved = false;
          }
        }
        break;
      case 'tmap_sets':
        if (this.map.tmaps) {
          for (const map of this.map.tmaps) {
            map.group = 'tmaps';
            if (map.unsaved) this.save(map);
            map.unsaved = false;
          }
        }
        break;
      default:
    }
  }

  close(): void {
    this.map.settingsOpen = false;
  }

  async fetchMap(): Promise<void> {
    if (this.map.tileSettings) {
      this.map.tileSettings = false;
      this.map.settingsOpen = false;
      this.pending = false;
      return;
    }

    this.pending = true;
    const tile = this.shown || this.map.selectedTile;
    switch (tile.group) {
      case 'tile_sets':
        this.handleTileSet(await this.socket.request(OutCmd.TileSetGet, tile.id));
        break;
      case 'structure_sets':
        this.handleStructureSet(await this.socket.request(OutCmd.StructureSetGet, tile.id));
        break;
      case 'tmap_sets':
        this.handleTMapSet(await this.socket.request(OutCmd.TMapSetGet, tile.id));
        break;
      default:
        this.gotMap(await this.socket.request(OutCmd.MapGet, { group: tile.group, tile: tile.id }));
    }
    this.pending = false;
  }
}
