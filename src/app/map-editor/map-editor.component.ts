import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { MatDialog } from '@angular/material/dialog';
import { GuideComponent } from './guide/guide.component';
import { InCmd, OutCmd } from '../ws-messages';

export interface MapTile {
  x: number; y: number; v: number;
}

export type MapGroups = 'maps' | 'cgmaps' | 'tile_sets' | 'tiles' | 'structure_sets' | 'structures' | 'tmaps' | 'tmap_sets';

export interface DBTile {
  id: number;
  name: string;
  data?: any[];
  unsaved?: boolean;
  description?: string;
  type: number;
  group: MapGroups;
  tile_set?: number;
  tmap_set?: number;
  structure_set?: number;
  released?: boolean;
  weight?: number;
  undos: MapTile[][];
  redos: MapTile[][];
  activeFeature?: StructureData;
  activeGroup?: number;
  hex?: boolean;
  settings?: any;
}

export interface StructureData {
  group: number;
  type: number;
  density: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface MapEditor {
  selected: number;
  selectedTile: DBTile;
  tileSet?: DBTile;
  tiles?: DBTile[][];
  tmapSet?: DBTile;
  tmaps?: DBTile[];
  structureSet?: DBTile;
  structures?: DBTile[];
  settingsOpen: boolean;
  tileSettings?: boolean;
  hex?: boolean;
}

@Component({
  selector: 'q-map-editor',
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.css']
})
export class MapEditorComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  map: MapEditor = {
    selected: 50,
    selectedTile: {
      undos: [],
      redos: [],
      id: 0,
      type: 0,
      name: '',
      group: 'tile_sets',
      data: [],
    },
    settingsOpen: true,
  };


  constructor(private socket: WsService, private dialog: MatDialog) {
    const tile = this.map.selectedTile;
    for (let i = 0; i < 8; i++) {
      tile.data?.push([0, 0, 0, 0, 0, 0, 0, 0]);
    }
  }

  ngOnInit() {
    const session = localStorage.getItem(this.socket.user?.id + '-editor');
    if (session) {
      const s = JSON.parse(session);
      if (s.selectedTile) {
        s.selectedTile.undos = s.selectedTile.undos || [];
        s.selectedTile.redos = s.selectedTile.redos || [];
        Object.assign(this.map, s);
      }
    }
    window.addEventListener('beforeunload', this.saveSession);

    this.sub.add(this.socket.connected$.subscribe(v => {
      if (v) this.socket.send(OutCmd.EditorJoin);
    }));

    window.addEventListener('keydown', this.handleKey);
  }

  ngOnDestroy() {
    this.saveSession();
    window.removeEventListener('beforeunload', this.saveSession);
    this.sub.unsubscribe();
    window.removeEventListener('keydown', this.handleKey);
  }

  private saveSession = () => {
    localStorage.setItem(this.socket.user?.id + '-editor', JSON.stringify(
      this.map
    ));
  }

  openGuide() {
    this.dialog.open(GuideComponent, { hasBackdrop: false });
  }

  resetUndos = () => {
    this.map.selectedTile.undos = [];
    this.map.selectedTile.redos = [];
  }

  private handleKey = (e: KeyboardEvent) => {
    if (!e.ctrlKey || this.map.settingsOpen) return;

    const tile = this.map.selectedTile;
    if (e.key === 'z' && tile.undos.length) this.undo(tile.undos, tile.redos);
    if (e.key === 'y' && tile.redos.length) this.undo(tile.redos, tile.undos);
    if (e.key === 'e') {
      this.openSettings();
      e.preventDefault();
    }
    if (e.key === 's') {
      this.save();
      e.preventDefault();
    }
  }

  async save() {
    const tile = this.map.selectedTile;
    if (!tile.unsaved) return;
    if (this.map.tileSet) {
      tile.group = 'tiles';
      tile.tile_set = this.map.tileSet.id;
    } else if (this.map.structureSet) {
      tile.group = 'structures';
      tile.structure_set = this.map.structureSet.id;
    } else if (this.map.tmapSet) {
      tile.group = 'tmaps';
      tile.tmap_set = this.map.tmapSet.id;
    }
    const newTile: any = {};
    Object.assign(newTile, tile);
    await this.socket.request(OutCmd.MapSave, newTile);
    this.socket.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: 'Saved.' } });
    tile.unsaved = false;
  }

  undo = (source: MapTile[][], target: MapTile[][]) => {
    const changes = source.pop();
    const buffer = [];

    if (changes) for (const oldTile of changes) {
      const change = this.setTile(oldTile.x, oldTile.y, oldTile.v);
      if (change) buffer.push(change);
    }

    target.push(buffer);
  }

  setTile = (x: number, y: number, v: number) => {
    const tile = this.map.selectedTile;
    if (!tile.data || v === tile.data[y][x]) return;
    tile.unsaved = true;

    const oldTile = { x, y, v: tile.data[y][x] };
    tile.data[y][x] = v;
    return oldTile;
  }

  openSettings() {
    this.map.settingsOpen = true;
  }
}
