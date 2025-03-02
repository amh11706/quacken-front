/* eslint-disable camelcase */
import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../ws/ws.service';
import { GuideComponent } from './guide/guide.component';
import { InCmd, OutCmd } from '../ws/ws-messages';
import { EscMenuService } from '../esc-menu/esc-menu.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { KeyActions } from '../settings/key-binding/key-actions';
import { TwodRenderComponent } from '../lobby/cadegoose/twod-render/twod-render.component';
import { MapGroups, MapEditor, MapTile, DBTile } from './types';

interface RenderSetting {
  width: number;
  height: number;
  showIsland: boolean;
}

@Component({
    selector: 'q-map-editor',
    templateUrl: './map-editor.component.html',
    styleUrls: ['./map-editor.component.css'],
    standalone: false
})
export class MapEditorComponent implements OnInit, OnDestroy {
  @ViewChild(TwodRenderComponent) renderer?: TwodRenderComponent;
  @Input()
  private sub = new Subscription();

  renderSettings: Partial<Record<MapGroups, RenderSetting>> = {
    cgmaps: {
      width: 20,
      height: 36,
      showIsland: true,
    },
    fgmaps: {
      width: 31,
      height: 41,
      showIsland: false,
    },
  };

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
      tags: [],
    },
    settingsOpen: true,
  };

  constructor(
    private ws: WsService,
    public es: EscMenuService,
    private kbs: KeyBindingService,
  ) {
    const tile = this.editor.selectedTile;
    for (let i = 0; i < 8; i++) {
      tile.data?.push([0, 0, 0, 0, 0, 0, 0, 0]);
    }
  }

  ngOnInit(): void {
    const session = window.localStorage.getItem(this.ws.user?.id + '-editor');
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

    void this.es.setLobby(GuideComponent);
  }

  ngOnDestroy(): void {
    this.saveSession();
    window.removeEventListener('beforeunload', this.saveSession);
    this.sub.unsubscribe();
    void this.es.setLobby();
  }

  settings(): RenderSetting | undefined {
    return this.renderSettings[this.editor.selectedTile.group];
  }

  private saveSession = () => {
    window.localStorage.setItem(this.ws.user?.id + '-editor', JSON.stringify(
      this.editor,
    ));
  };

  openGuide(): void {
    void this.es.openTab(0);
  }

  resetUndos = (): void => {
    this.editor.selectedTile.undos = [];
    this.editor.selectedTile.redos = [];
  };

  private handleKeys() {
    this.sub.add(this.kbs.subscribe(KeyActions.Save, v => {
      if (this.editor.settingsOpen) return;
      if (v) void this.save();
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

  async save(): Promise<void> {
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
    const newTile = {} as DBTile;
    Object.assign(newTile, tile);
    const message = await this.ws.request(OutCmd.MapSave, newTile);
    void this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: message ?? 'Saved.', from: '' } });
    tile.unsaved = false;
  }

  undo = (source: MapTile[][], target: MapTile[][]): void => {
    const changes = source.pop();
    const buffer = [];

    if (changes) {
      for (const oldTile of changes) {
        const change = this.setTile(oldTile.x, oldTile.y, oldTile.v);
        if (change) buffer.push(change);
      }
    }

    target.push(buffer);
  };

  setTile = (x: number, y: number, v: number): { x: number, y: number, v: number } | undefined => {
    const settings = this.settings();
    if (settings) {
      if (x < 0 || x >= settings.width || y < 3 || y >= settings.height - 3) return;
    } else {
      if (x < 0 || x > 24 || y < 0 || y > 48) return;
    }
    const tile = this.editor.selectedTile;
    if (!tile.data || v === tile.data[y][x]) return;
    tile.unsaved = true;
    const oldTile = { x, y, v: tile.data[y][x] };
    tile.data[y][x] = v;
    void this.renderer?.fillMap(tile.data, []);
    return oldTile;
  };

  openSettings(): void {
    this.editor.settingsOpen = true;
  }
}
