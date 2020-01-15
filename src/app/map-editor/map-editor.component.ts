import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { MatDialog } from '@angular/material';
import { GuideComponent } from './guide/guide.component';

export interface MapTile {
  x: number, y: number, v: number,
}

export interface DBTile {
  id: number,
  name: string,
  data?: any[],
  unsaved?: boolean,
  description?: string,
  type?: number,
  group?: string,
  tile_set?: number,
  structure_set?: number,
  released?: boolean,
  weight?: number,
  undos: MapTile[][],
  redos: MapTile[][],
  activeFeature?: StructureData,
  activeGroup?: number,
  hex?: boolean;
}

export interface StructureData {
  group: number,
  type: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
}

export interface MapEditor {
  selected: number,
  selectedTile: DBTile,
  tileSet?: DBTile,
  tiles?: DBTile[][],
  structureSet?: DBTile,
  structures?: DBTile[],
  settingsOpen: boolean,
  tileSettings?: boolean,
  hex?: boolean;
}

@Component({
  selector: 'app-map-editor',
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.css']
})
export class MapEditorComponent implements OnInit, OnDestroy {
  private sub: Subscription;

  map: MapEditor = {
    selected: 50,
    selectedTile: {
      undos: [],
      redos: [],
      id: null,
      name: '',
      group: 'tile_sets',
      data: [],
    },
    settingsOpen: true,
  };


  constructor(private socket: WsService, private dialog: MatDialog) {
    const tile = this.map.selectedTile;
    for (let i = 0; i < 8; i++) {
      tile.data.push([0, 0, 0, 0, 0, 0, 0, 0]);
    }
  }

  ngOnInit() {
    const session = localStorage.getItem(this.socket.user.id + "-editor");
    if (session) {
      const s = JSON.parse(session);
      if (s.selectedTile) {
        s.selectedTile.undos = s.selectedTile.undos || [];
        s.selectedTile.redos = s.selectedTile.redos || [];
        Object.assign(this.map, s);
      }
    }
    window.addEventListener('beforeunload', this.saveSession);
    this.socket.send('joinEditor');

    this.sub = this.socket.subscribe('saveMap', this.handleSave);
    this.sub.add(this.socket.connected$.subscribe(value => {
      if (value) this.socket.send('joinEditor');
    }));

    window.addEventListener('keydown', this.handleKey);
  }

  ngOnDestroy() {
    this.saveSession();
    window.removeEventListener('beforeunload', this.saveSession);
    if (this.sub) this.sub.unsubscribe();
    window.removeEventListener('keydown', this.handleKey);
  }

  private saveSession = () => {
    localStorage.setItem(this.socket.user.id + '-editor', JSON.stringify(
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

  private handleSave = () => {
    this.socket.dispatchMessage({ cmd: 'm', data: { type: 1, message: 'Saved.' } });
  }

  save() {
    const tile = this.map.selectedTile;
    if (!tile.unsaved) return;
    if (this.map.tileSet) {
      tile.group = 'tiles';
      tile.tile_set = this.map.tileSet.id;
    } else if (this.map.structureSet) {
      tile.group = 'structures';
      tile.structure_set = this.map.structureSet.id;
    }
    const newTile: any = {};
    Object.assign(newTile, tile);
    this.socket.send('saveMap', newTile);
    tile.unsaved = false;
  }

  undo = (source: MapTile[][], target: MapTile[][]) => {
    const changes = source.pop();
    const buffer = [];

    for (let oldTile of changes) {
      const change = this.setTile(oldTile.x, oldTile.y, oldTile.v);
      if (change) buffer.push(change);
    }

    target.push(buffer);
  }

  setTile = (x: number, y: number, v: number) => {
    const tile = this.map.selectedTile;
    if (v === tile.data[y][x]) return;
    tile.unsaved = true;

    const oldTile = { x, y, v: tile.data[y][x] };
    tile.data[y][x] = v;
    return oldTile;
  }

  openSettings() {
    this.map.settingsOpen = true;
  }
}
