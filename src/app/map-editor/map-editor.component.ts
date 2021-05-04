import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { GuideComponent } from './guide/guide.component';
import { InCmd, OutCmd } from '../ws-messages';
import { EscMenuService } from '../esc-menu/esc-menu.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { KeyActions } from '../settings/key-binding/key-actions';
import { TwodRenderComponent } from '../lobby/cadegoose/twod-render/twod-render.component';

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
  settings?: any;
  error?: string;
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
}



@Component({
  selector: 'q-map-editor',
  templateUrl: './map-editor.component.html',
  styleUrls: ['./map-editor.component.css']
})
export class MapEditorComponent implements OnInit, OnDestroy {
  @ViewChild(TwodRenderComponent) renderer?: TwodRenderComponent;
  @Input()
  private sub = new Subscription();
  private twod : any;
  editor: MapEditor = {
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


  constructor(
    private ws: WsService,
    private es: EscMenuService,
    private kbs: KeyBindingService,
  ) {
    const tile = this.editor.selectedTile;
    for (let i = 0; i < 8; i++) {
      tile.data?.push([0, 0, 0, 0, 0, 0, 0, 0]);
    }
  }

  ngOnInit() {
    const session = localStorage.getItem(this.ws.user?.id + '-editor');
    if (session) {
      const s = JSON.parse(session);
      if (s.selectedTile) {
        s.selectedTile.undos = s.selectedTile.undos || [];
        s.selectedTile.redos = s.selectedTile.redos || [];
        Object.assign(this.editor, s);
      }
    }
    window.addEventListener('beforeunload', this.saveSession);
    this.handleKeys();

    this.sub.add(this.ws.connected$.subscribe(v => {
      if (v) this.ws.send(OutCmd.EditorJoin);
    }));

    this.es.setLobby(GuideComponent);
  }

  ngOnDestroy() {
    this.saveSession();
    window.removeEventListener('beforeunload', this.saveSession);
    this.sub.unsubscribe();
    this.es.setLobby();
  }

  private saveSession = () => {
    localStorage.setItem(this.ws.user?.id + '-editor', JSON.stringify(
      this.editor
    ));
  }

  openGuide() {
    this.es.open = true;
    this.es.activeTab = 0;
  }

  resetUndos = () => {
    this.editor.selectedTile.undos = [];
    this.editor.selectedTile.redos = [];
  }

  private handleKeys() {
    this.sub.add(this.kbs.subscribe(KeyActions.Save, v => {
      if (this.editor.settingsOpen) return;
      if (v) this.save();
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.Redo, v => {
      if (this.editor.settingsOpen) return;
      const tile = this.editor.selectedTile;
      if (v && tile.redos.length) this.undo(tile.redos, tile.undos);
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.Undo, v => {
      if (this.editor.settingsOpen) return;
      const tile = this.editor.selectedTile;
      if (v && tile.undos.length) this.undo(tile.undos, tile.redos);
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.OpenMenu, v => {
      if (this.editor.settingsOpen) return;
      if (v) this.openSettings();
    }));
  }

  async save() {
    const tile = this.editor.selectedTile;
    if (!tile.unsaved) return;
    if (this.editor.tileSet) {
      tile.group = 'tiles';
      tile.tile_set = this.editor.tileSet.id;
    } else if (this.editor.structureSet) {
      tile.group = 'structures';
      tile.structure_set = this.editor.structureSet.id;
    } else if (this.editor.tmapSet) {
      tile.group = 'tmaps';
      tile.tmap_set = this.editor.tmapSet.id;
    }
    const newTile: any = {};
    Object.assign(newTile, tile);
    await this.ws.request(OutCmd.MapSave, newTile);
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: 'Saved.' } });
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
    const tile = this.editor.selectedTile;
    if (!tile.data || v === tile.data[y][x]) return;
    tile.unsaved = true;

    const oldTile = { x, y, v: tile.data[y][x] };
    tile.data[y][x] = v;
    this.renderer?.redraw(this.editor.selectedTile.data! , [])
    return oldTile;
  }

  openSettings() {
    this.editor.settingsOpen = true;
  }
}
