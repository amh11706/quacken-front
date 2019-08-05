import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { MatDialog } from '@angular/material';
import { GuideComponent } from './guide/guide.component';

@Component({
  selector: 'app-map-editor',
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.css']
})
export class MapEditorComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  changeTile: () => void;
  key: (e: any) => void;

  private clickX: number;
  private clickY: number;
  undos = [];
  redos = [];

  map: any = {
    selectedTile: {
      id: 0,
      group: 'tile_sets',
      name: '',
      description: '',
      type: 0,
      tile_set: 0,
      structure_set: 0,
      released: false,
      data: [],
      unsaved: false,
    },
    tileSet: null,
    tiles: null,
    structureSet: null,
    structures: null,
    settingsOpen: true,
  }

  obstacles = [1, 2, 3, 4, 6, 7, 5, 8, 10, 11, 9, 12, 15, 16, 14, 13, 50, 51];
  scrollOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 13, 50, 51];
  titles = [
    'Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg',
    'Right Wind', 'Down Wind', 'Up Wind', 'Left Wind',
    'Whirl 1', 'Whirl 2', 'Whirl 3', 'Whirl 4',
    'Reverse Whirl 1', 'Reverse Whirl 2', 'Reverse Whirl 3', 'Reverse Whirl 4',
    'Rock', 'Fragile Rock'
  ];

  selected = 50;
  painting = false;
  private selectedTile;

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
      this.map = s.map;
      this.undos = s.undos;
      this.redos = s.redos;
    }
    window.addEventListener('beforeunload', this.saveSession);
    this.socket.send('joinEditor');

    this.sub = this.socket.subscribe('saveMap', () => this.handleSave());
    this.sub.add(this.socket.connected$.subscribe(value => {
      if (value) this.socket.send('joinEditor');
    }));

    this.selectedTile = document.getElementById('selected');

    this.changeTile = this.resetUndos.bind(this);
    this.key = this.handleKey.bind(this);
    window.addEventListener('keydown', this.key);
  }

  ngOnDestroy() {
    this.saveSession();
    window.removeEventListener('beforeunload', this.saveSession);
    if (this.sub) this.sub.unsubscribe();
    window.removeEventListener('keydown', this.key);
  }

  private saveSession = () => {
    localStorage.setItem(this.socket.user.id + '-editor', JSON.stringify(
      { map: this.map, undos: this.undos, redos: this.redos }
    ));
  }

  openGuide() {
    this.dialog.open(GuideComponent, { hasBackdrop: false });
  }

  resetUndos() {
    this.undos = [];
    this.redos = [];
  }

  private handleKey(e) {
    if (!e.ctrlKey || this.map.settingsOpen) return;

    if (e.key === 'z' && this.undos.length) this.undo(this.undos, this.redos);
    if (e.key === 'y' && this.redos.length) this.undo(this.redos, this.undos);
    if (e.key === 'e') {
      this.map.settingsOpen = true;
      e.preventDefault();
    }
    if (e.key === 's') {
      this.save();
      e.preventDefault();
    }
  }

  private handleSave() {
    this.socket.dispatchMessage({ cmd: 'm', data: { type: 1, message: 'Saved.' } });
  }

  save() {
    const tile = this.map.selectedTile;
    if (this.map.tileSet) {
      tile.group = 'tiles';
      tile.tile_set = this.map.tileSet.id;
    } else if (this.map.structureSet) {
      tile.group = 'structures';
      tile.structure_set = this.map.structureSet.id;
    }
    const newTile: any = {};
    Object.assign(newTile, tile);
    if (newTile.data) newTile.data = JSON.stringify(newTile.data);
    this.socket.send('saveMap', newTile);
    tile.unsaved = false;
  }

  mouseMove(e) {
    this.selectedTile.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }

  scroll(e) {
    e.preventDefault();
    const current = this.scrollOrder.indexOf(this.selected);
    if (e.wheelDeltaY < 0) {
      this.selected = this.scrollOrder[current + 1] || this.scrollOrder[0];
    } else {
      this.selected = this.scrollOrder[current - 1] || this.scrollOrder[this.scrollOrder.length - 1];
    }
  }

  undo(source: any[], target: any[]) {
    const changes = source.pop();
    const buffer = [];

    for (let oldTile of changes) {
      const change = this.setTile(oldTile.x, oldTile.y, oldTile.v);
      if (change) buffer.push(change);
    }

    target.push(buffer);
  }

  private setTile(x: number, y: number, v: number) {
    const tile = this.map.selectedTile;
    if (v === tile.data[y][x]) return;
    tile.unsaved = true;

    const oldTile = { x, y, v: tile.data[y][x] };
    tile.data[y][x] = v;
    return oldTile;
  }

  clickTile(e, x: number, y: number) {
    const tile = this.map.selectedTile;
    if (this.painting && e.which === 1 && tile.data[y][x]) return;
    if (e.shiftKey) {
      this.selected = tile.data[y][x] || this.selected;
      return;
    }
    this.painting = e.ctrlKey;
    if (!e.ctrlKey) {
      this.clickX = e.clientX;
      this.clickY = e.clientY;
      return;
    }

    const newValue = e.which === 1 ? this.selected : 0;
    const change = this.setTile(x, y, newValue);
    if (!change) {
      if (newValue < 17 && newValue > 8) this.finishWhirl(x, y, []);
      return;
    }

    if (this.redos.length) this.redos = [];
    if (newValue < 17 && newValue > 8) this.finishWhirl(x, y, [change]);
    else this.undos.push([change]);
  }

  mouseUp(e, x: number, y: number) {
    const tile = this.map.selectedTile;
    if (Math.abs(e.clientX - this.clickX) + Math.abs(e.clientY - this.clickY) > 20) return
    if (this.redos.length && tile.data[y][x] !== this.selected) this.redos = [];
    this.clickX = 0;
    this.clickY = 0;

    const newValue = e.which === 1 ? this.selected : 0;
    const change = this.setTile(x, y, newValue);
    if (!change) return;

    this.undos.push([change]);
    if (this.redos.length) this.redos = [];
  }

  private finishWhirl(x: number, y: number, changes: any[]) {
    this.painting = false;
    const dx = [0, 1, 0, -1];
    const dy = [-1, 0, 1, 0];
    let tile = (this.selected - 1) % 4;
    const inverted = this.selected > 12 ? 4 : 0;

    for (let i = 0; i < 3; i++) {
      x += dx[tile];
      y += dy[tile];
      if (inverted) tile = (tile + 3) % 4;
      else tile = (tile + 1) % 4;

      const sTile = this.map.selectedTile;
      if (sTile.data[y] && sTile.data[y][x] === 0) {
        const change = this.setTile(x, y, tile + 9 + inverted);
        if (!change) continue;
        if (this.redos.length) this.redos = [];
        changes.push(change);
      }
    }

    if (changes.length) this.undos.push(changes);
  }

  openSettings() {
    this.map.settingsOpen = true;
    this.resetUndos();
    if (this.map.structureSet) {
      this.map.selectedTile = this.map.structureSet;
      this.map.structureSet = null;
      this.map.structures = null;
    } else if (this.map.tileSet) {
      this.map.selectedTile = this.map.tileSet;
      this.map.tileSet = null;
      this.map.tiles = null;
    }
  }
}
