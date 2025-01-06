import { Component } from '@angular/core';
import { CadegooseComponent } from '../cadegoose/cadegoose.component';
import { MainMenuService } from '../cadegoose/main-menu/main-menu.service';
import { CadegooseModule } from '../cadegoose/cadegoose.module';
import { TwodRenderModule } from '../cadegoose/twod-render/twod-render.module';
import { HudComponent } from './hud/hud.component';
import { BABoatSettings, BaRender } from './ba-render';
import { InCmd, Internal } from '../../ws/ws-messages';
import { TileEvent } from '../cadegoose/twod-render/twod-render.component';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { BoatListComponent, DefaultBoat } from './boat-list/boat-list.component';
import { BoatSync } from '../quacken/boats/types';
import { BoatTypes } from '../quacken/boats/boat-types';
import { GuBoat } from '../cadegoose/twod-render/gu-boats/gu-boat';
import { Boat } from '../quacken/boats/boat';
import { BaMainMenuComponent } from './main-menu/main-menu.component';

export const BoardadmiralDesc = 'Board Admiral: Command your fleet to victory in a game of naval strategy and tactics.';

const fakeBoat: BoatSync = {
  id: 0,
  team: 0,
  x: 0,
  y: 0,
  t: 0,
  inSZ: false,
  n: 'Boat 1',
  f: 0,
  b: 0,
  tp: 50,
  ty: BoatTypes.WarFrig,
  ml: 0,
  mDamage: 100,
  mMoves: 3,
  inSq: 16,
};

interface BaAction {
  cmd: 'addTile' | 'removeTile';
  data: any;
}

@Component({
  selector: 'q-boardadmiral',
  standalone: true,
  imports: [CadegooseModule, TwodRenderModule, HudComponent, BoatListComponent],
  templateUrl: './boardadmiral.component.html',
  styleUrl: './boardadmiral.component.scss',
  providers: [MainMenuService],

})
export class BoardadmiralComponent extends CadegooseComponent {
  protected menuComponent = BaMainMenuComponent;
  protected joinMessage = BoardadmiralDesc;
  private render = new BaRender();
  private defaultBoat = new BABoatSettings(DefaultBoat);
  activeBoatSettings = this.defaultBoat;
  activeBoat = DefaultBoat;
  boatSettings = new Map<number, BABoatSettings>();
  private boatList: Boat[] = [];

  private undoTicker = 0;

  private fakeBoats() {
    this.ss.getGroup('graphics').then(() => {
      this.es.openMenu(false);
    });

    GuBoat.myTeam = 0;
    this.ws.dispatchMessage({
      cmd: InCmd.Sync, data: {
        turn: 0, cSync: [],
        sync: [
          { ...fakeBoat, x: 10, y: 10, n: 'Boat 1', id: 1 },
          { ...fakeBoat, x: 10, y: 15, n: 'Boat 2', id: 2 },
          { ...fakeBoat, x: 15, y: 10, n: 'Boat 3', id: 3 },
          { ...fakeBoat, x: 15, y: 15, n: 'Boat 4', id: 4 },
        ]
      }
    });
    DefaultBoat.isMe = true;
    this.boats.setMyBoat(DefaultBoat, false);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.sub.add(this.render.canvasChange$.subscribe(canvas => {
      this.ws.dispatchMessage({ cmd: Internal.Canvas, data: canvas });
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.Redo, v => {
      if (!v) return clearInterval(this.undoTicker);
      this.doUndo(this.redos, this.undos);
      this.undoTicker = window.setInterval(() => this.doUndo(this.redos, this.undos), 200);
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.Undo, v => {
      if (!v) return clearInterval(this.undoTicker);
      this.doUndo(this.undos, this.redos);
      this.undoTicker = window.setInterval(() => this.doUndo(this.undos, this.redos), 200);
    }));

    this.fakeBoats();
  }

  activeBoatChange(boat: Boat) {
    this.activeBoat.isMe = false;
    this.activeBoat = boat;
    boat.isMe = true;
    DefaultBoat.isMe = true;
    this.boats.setMyBoat(DefaultBoat, false);

    this.activeBoatSettings = this.boatSettings.get(boat.id) || new BABoatSettings(boat);
    this.render.drawBoats(this.boatSettings, this.activeBoatSettings);
  }

  private undos: BaAction[] = [];
  private redos: BaAction[] = [];

  private doAction(action: BaAction): BaAction | undefined {
    switch (action.cmd) {
      case 'addTile':
        return this.addTile(action.data.x, action.data.y, action.data.a);
      case 'removeTile':
        return this.removeTile(action.data.x, action.data.y);
    }
  }

  doUndo = (undos: BaAction[], redos: BaAction[]) => {
    const action = undos.pop();
    if (!action) return;
    const redo = this.doAction(action);
    if (redo) redos.push(redo);
    this.render.drawBoats(this.boatSettings, this.activeBoatSettings);
  }

  gotBoats(boats: Boat[]): void {
    this.boatList = boats;
    const settings = new Map<number, BABoatSettings>();
    for (const boat of boats) {
      const boatSettings = this.boatSettings.get(boat.id) || new BABoatSettings(boat);
      settings.set(boat.id, boatSettings);
    }
    this.boatSettings = settings;
  }

  private findNearestBoat(x: number, y: number): Boat | undefined {
    let minDist = 1000;
    let nearest: Boat | undefined;
    for (const boat of this.boatList) {
      const dist = Math.abs(boat.pos.x - x) + Math.abs(boat.pos.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = boat;
      }
    }
    return nearest;
  }

  private tileIsSet(x: number, y: number): boolean {
    return this.activeBoatSettings.coverage[this.activeBoatSettings.coverMode].some(tile => tile.x === x && tile.y === y);
  }

  private removeTile(x: number, y: number): BaAction {
    const coverage = this.activeBoatSettings.coverage[this.activeBoatSettings.coverMode];
    const index = coverage.findIndex(tile => tile.x === x && tile.y === y);
    if (index !== -1) coverage.splice(index, 1);
    return { cmd: 'addTile', data: { x, y } };
  }

  private addTile(x: number, y: number, a?: number): BaAction {
    this.activeBoatSettings.coverage[this.activeBoatSettings.coverMode].push({ x, y, a });
    return { cmd: 'removeTile', data: { x, y } };
  }

  private toggleTile(x: number, y: number, a?: number): void {
    if (this.tileIsSet(x, y)) this.undos.push(this.removeTile(x, y));
    else this.undos.push(this.addTile(x, y, a));
    this.render.drawBoats(this.boatSettings, this.activeBoatSettings);
  }

  private painting = false;
  private paintMode: 'draw' | 'erase' = 'draw';

  hoverTile(e: TileEvent) {
    if (this.activeBoat.id === 0) return;
    if (!this.painting) return;
    if (this.paintMode === 'erase') this.undos.push(this.removeTile(e.tile.x, e.tile.y));
    else if (!this.tileIsSet(e.tile.x, e.tile.y)) this.undos.push(this.addTile(e.tile.x, e.tile.y));
    this.render.drawBoats(this.boatSettings, this.activeBoatSettings);
  }

  private mouseDownCoords?: { x: number, y: number };

  mouseDownTile(e: TileEvent) {
    this.mouseDownCoords = { x: e.clientX, y: e.clientY };
    if (this.activeBoat.id === 0) return;
    if (!e.ctrlKey) return;
    this.painting = true;
    this.paintMode = this.tileIsSet(e.tile.x, e.tile.y) ? 'erase' : 'draw';
    this.hoverTile(e);
  }

  clickTile(e: TileEvent) {
    if (this.painting) {
      this.painting = false;
      return;
    }
    if (e.shiftKey) {
      const nearest = this.findNearestBoat(e.tile.x, e.tile.y);
      if (!nearest) return;
      if (nearest.id === this.activeBoatSettings.boat.id) this.activeBoatChange(DefaultBoat);
      else this.activeBoatChange(nearest);
      return;
    }
    if (this.activeBoat.id === 0) return;
    if (Math.abs(e.clientX - this.mouseDownCoords!.x) > 5 || Math.abs(e.clientY - this.mouseDownCoords!.y) > 5) return;
    this.toggleTile(e.tile.x, e.tile.y);
    this.render.drawBoats(this.boatSettings, this.activeBoatSettings);
  }
}
