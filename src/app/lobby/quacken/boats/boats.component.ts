import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../../ws.service';
import { Boat } from './boat';
import { Lobby } from '../../lobby.component';
import { weapons } from '../hud/hud.component';
import { InCmd, Internal, OutCmd } from 'src/app/ws-messages';

export interface Clutter {
  t: number;
  x: number;
  y: number;
  d?: number;
  p?: boolean;
  dir?: number;
  dis?: number;
  dbl?: number;
}

export interface Turn {
  turn: number;
  steps: BoatStatus[][];
  cSteps: Clutter[][];
  treasure: number[];
  points: number[];
}

interface Sync {
  sync: BoatSync[];
  cSync: Clutter[];
}

interface BoatStatus {
  id: number;
  x: number;
  y: number;
  t: number;
  tf?: number;
  tm?: number;
  s?: number;
  c?: number;
  cd?: number;
}

export interface BoatSync extends BoatStatus {
  oId?: number;
  team?: number;
  n: string;
  ti?: string;
  f: number;
  b: number;
  tp: number;
  ty: number;
  ml: number;
  ms: number;
  mDamage: number;
  mMoves: number;
  inSq: number;
  dShot?: boolean;
}

@Component({
  selector: 'q-boats',
  templateUrl: './boats.component.html',
  styleUrls: ['./boats.component.scss']
})
export class BoatsComponent implements OnInit, OnDestroy {
  weapons = weapons;
  clutterTypes = [
    'powderkeg',
    'duckpoo',
    'feathers',
    'bread',
    'head',
  ];
  clutter: Clutter[] = [];
  szFade = ', opacity .8s linear .7s';
  moveNames = ['', 'left', 'forward', 'right', 'obscured', 'overmove'];
  titles = ['', ', Cuttle Cake', ', Taco Locker', ', Pea Pod', ', Fried Egg'];

  myBoat = new Boat('');
  boats: Boat[] = [];

  protected _boats: { [k: number]: Boat } = {};
  private subs = new Subscription();
  protected animateTimeout?: number;
  private blurred = false;
  protected step = -1;
  protected turn?: Turn;

  @Input() speed = 10;
  @Input() map?: HTMLElement;
  @Input() hex = false;
  @Input() getX = (p: { x: number, y: number }): number => (p.x) * 50;
  @Input() getY = (p: { x: number, y: number }): number => (p.y) * 50;
  getObj = (o: Clutter): string => `translate(${this.getX(o)}px,${this.getY(o)}px)`;
  @Input() moveTransition = (transition: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 1: return 10 / this.speed + 's linear';
      case 2: return 10 / this.speed + 's ease-in';
      case 3: return 10 / this.speed + 's ease-out';
      case 4: return '.1s linear';
      default: return '';
    }
  }
  @Input() rotateTransition = (b: Boat): string => {
    if (b.rotateTransition === 1) {
      return 9 / this.speed + 's ease ' + 1 / this.speed + 's';
    }
    return [
      '0s linear',
      '', // normal rotate handled above
      '3s linear .5s', // sink rotate
      '1s ease', // duck poo
      '.2s ease' // defenduck spin
    ][b.rotateTransition];
  }

  constructor(protected ws: WsService) { }

  ngOnInit() {
    document.addEventListener('visibilitychange', this.visibilityChange);

    this.subs.add(this.ws.subscribe(Internal.Boats, (m: Lobby) => {
      if (!m.boats) return;
      clearTimeout(this.animateTimeout);
      delete this.turn;
      this.myBoat.isMe = false;
      this.boats = [];
      this._boats = {};
      this.setBoats(Object.values(m.boats));
      this.clutter = m.clutter || this.clutter;
    }));
    this.subs.add(this.ws.subscribe(InCmd.NewBoat, (boat: BoatSync) => this.setBoats([boat])));
    this.subs.add(this.ws.subscribe(InCmd.DelBoat, (id: number) => this.deleteBoat(id)));
    this.subs.add(this.ws.subscribe(InCmd.Moves, s => {
      const boat = this._boats[s.t];
      if (boat) boat.moves = s.m;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Ready, id => {
      const boat = this._boats[id];
      if (boat) boat.ready = true;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Bomb, b => {
      const boat = this._boats[b.t];
      if (boat) boat.bomb = b.m;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Turn, this.handleTurn));
    this.subs.add(this.ws.subscribe(InCmd.Sync, this.syncBoats));
  }

  ngOnDestroy() {
    clearTimeout(this.animateTimeout);
    document.removeEventListener('visibilitychange', this.visibilityChange);
    this.subs.unsubscribe();
  }

  protected deleteBoat(id: number) {
    if (id === this.myBoat.id) {
      const pos = this.myBoat.pos;
      this.ws.dispatchMessage({ cmd: Internal.MyBoat, data: new Boat('').setPos(pos.x, pos.y) });
      this.myBoat.isMe = false;
    }
    if (this.turn) return;
    delete this._boats[id];
    this.boats = Object.values(this._boats);
  }

  trackBy(_i: number, c: Clutter): string {
    return c.x + ',' + c.y;
  }

  private visibilityChange = () => {
    this.blurred = document.hidden;

    if (this.blurred) {
      clearTimeout(this.animateTimeout);
      if (this.step >= 0 || this.turn) {
        for (const boat of this.boats) {
          boat.moves = [0, 0, 0, 0];
          boat.bomb = 0;
          boat.ready = false;
        }
      }
      this.ws.send(OutCmd.Sync);
      this.step = -1;
    } else {
      this.ws.dispatchMessage({ cmd: Internal.UnlockMoves });
    }
  }

  private handleTurn = (turn: Turn) => {
    // first turn is only for starting the entry
    if (turn.turn === 1) {
      setTimeout(() => {
        for (const boat of this.boats) boat.ready = false;
        this.ws.dispatchMessage({ cmd: Internal.UnlockMoves });
      }, 1000);
      return;
    }

    this.turn = turn;
    this.step = 0;
    clearTimeout(this.animateTimeout);

    let moveFound = false;
    for (const step of turn.steps) if (step) moveFound = true;
    if (!moveFound) for (const step of turn.cSteps) if (step && step.length) moveFound = true;

    if (!moveFound || this.blurred) {
      this.resetBoats();
      setTimeout(() => this.ws.send(OutCmd.Sync), 1000);
      return;
    }

    for (const boat of this.boats) boat.ready = true;
    this.playTurn();
  }

  protected resetBoats(): void {
    for (const boat of this.boats) {
      boat.moves = [0, 0, 0, 0];
      boat.bomb = 0;
    }
    this.ws.dispatchMessage({ cmd: Internal.UnlockMoves });
  }

  protected playTurn() {
    const clutterPart = this.turn?.cSteps[this.step] || [];
    setTimeout(() => this.handleUpdate(clutterPart), 10000 / this.speed);
    const turnPart = this.turn?.steps[this.step] || [];
    for (const u of turnPart) {
      const boat = this._boats[u.id];
      if (!boat || u.tm === undefined || u.tf === undefined) continue;

      if (u.c && u.c > 0) boat.addDamage(u.c - 1, u.cd || 0);
      boat.rotateTransition = 1;
      boat.setTreasure(u.t)
        .setPos(u.x, u.y)
        .setTransition(u.tf, u.tm)
        .draw();

      if (u.s) {
        boat.face += boat.spinDeg * u.s;
        if (u.s > -2) {
          boat.rotateTransition = 4;
          setTimeout(() => { if (u.tm) boat.rotateByMove(u.tm).rotateTransition = 1; }, 300);
        } else {
          boat.rotateByMove(u.tm).rotateTransition = 3;
        }
      } else boat.rotateByMove(u.tm);
    }

    if (this.step === 4) this.resetBoats();

    this.step++;
    const delay = (this.turn?.steps[this.step] || this.turn?.cSteps[this.step] ? 750 : 250) * 20 / this.speed;
    if (this.step < 8) this.animateTimeout = window.setTimeout(() => this.playTurn, delay);
    else this.animateTimeout = window.setTimeout(() => this.ws.send(OutCmd.Sync), 2500);
  }

  trackBoatBy(_i: number, b: Boat): number {
    return b.id || 0;
  }

  private syncBoats = (sync: Sync) => {
    if (!sync || !this.turn) return;
    delete this.turn;
    this.step = -1;

    setTimeout(() => this.clutter = sync.cSync || [], 1000);
    if (sync.sync) {
      this._boats = {};
      this.setBoats(sync.sync);
    }
  }

  protected sortBoats() {
    this.boats.sort((a, b) => {
      if (a.pos.y > b.pos.y) return 1;
      if (a.pos.y < b.pos.y) return -1;
      return b.pos.x - a.pos.x;
    });
  }

  protected setBoats(boats: BoatSync[]) {
    if (this.turn) return;
    for (const sBoat of boats) {
      if (sBoat.oId) delete this._boats[sBoat.oId];
      const oldBoat = this.myBoat;
      const boat = new Boat(sBoat.n, sBoat.ty, sBoat.id === this.ws.sId)
        .setPos(sBoat.x, sBoat.y)
        .setTreasure(sBoat.t)
        .draw();
      if (sBoat.ti) boat.title = sBoat.ti;
      boat.spinDeg = 360 / sBoat.ms;
      boat.face = sBoat.f * boat.spinDeg;
      boat.moveLock = sBoat.ml;
      boat.tokenPoints = sBoat.tp;
      boat.bomb = sBoat.b;
      boat.id = sBoat.id;
      boat.oId = sBoat.oId;
      boat.team = sBoat.team;
      boat.maxDamage = sBoat.mDamage;
      boat.maxMoves = sBoat.mMoves;
      boat.influence = Math.sqrt(sBoat.inSq) * 100 + 'px';
      boat.doubleShot = sBoat.dShot;
      this._boats[sBoat.id] = boat;

      if (boat.isMe) {
        if (oldBoat.isMe) {
          if (boat.oId !== oldBoat.oId) this.myBoat.moves = [0, 0, 0, 0];
          if (sBoat.ty !== oldBoat.type || oldBoat.damage > 100) {
            oldBoat.type = sBoat.ty;
            setTimeout(() => {
              this.ws.dispatchMessage({ cmd: Internal.MyBoat, data: oldBoat });
              this.map?.dispatchEvent(new Event('dblclick'));
            });
          }
          boat.moves = oldBoat.moves;
          boat.damage = oldBoat.damage;
          Object.assign(oldBoat, boat);
          this._boats[sBoat.id] = oldBoat;
        } else {
          setTimeout(() => {
            this.ws.dispatchMessage({ cmd: Internal.MyBoat, data: boat });
            this.map?.dispatchEvent(new Event('dblclick'));
          });
          this.myBoat = boat;
        }
      }
    }
    this.boats = Object.values(this._boats);
    this.sortBoats();

    if (this.myBoat.isMe && !this._boats[this.ws.sId || 0]) {
      this.myBoat = new Boat('');
      this.ws.dispatchMessage({ cmd: Internal.MyBoat, data: this.myBoat });
    }
  }

  protected handleUpdate(updates: Clutter[]) {
    for (const u of updates) {
      if (u.dis) {
        this.clutter.push(u);
        continue;
      }
      const c = this.clutter.find(elem => {
        return elem.x === u.x && elem.y === u.y;
      });

      if (!c) {
        this.clutter.push(u);
        continue;
      }
      c.p = u.p;
      c.d = u.d;
    }
  }

}
