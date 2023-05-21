import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import * as TWEEN from '@tweenjs/tween.js';

import { InCmd, Internal, OutCmd } from '../../../ws-messages';
import { WsService } from '../../../ws.service';
import { Boat, Team } from './boat';
import { BoatStatus, BoatSync, boatToSync, syncToBoat } from './convert';
import { Lobby } from '../../lobby.component';
import { weapons } from '../hud/hud.component';
import { StatRow } from '../../cadegoose/stats/stats.component';
import { BoatRender } from '../../cadegoose/boat-render';

export interface Clutter {
  id?: number;
  t: number;
  x: number;
  y: number;
  d?: number;
  p?: boolean;
  dir?: number;
  dis?: number;
  dbl?: number;
  tm?: number;
  tf?: number;
  u?: { x: number, y: number, v: number }[];
}

export interface Turn {
  turn: number;
  steps: BoatStatus[][];
  cSteps: Clutter[][];
  treasure: number[];
  points: number[];
  flags: { x: number, y: number, t: Team, p: number, cs: number[] }[];
  stats: Record<number, StatRow>;
}

export interface Sync {
  sync: BoatSync[];
  cSync: Clutter[];
  turn: number;
}

@Component({
  selector: 'q-boats',
  templateUrl: './boats.component.html',
  styleUrls: ['./boats.component.scss'],
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

  _boats: { [k: number]: Boat } = {};
  protected subs = new Subscription();
  protected animateTimeout?: number;
  protected animateTimeout2?: number;
  protected animateTimeout3?: number;
  private blurred = false;
  protected step = -1;
  protected turn?: Turn;

  @Input() speed = 10;
  @Input() map?: HTMLElement;
  @Input() getX = (p: { x: number, y: number }): number => (p.x) * 50;
  @Input() getY = (p: { x: number, y: number }): number => (p.y) * 50;
  getObj = (o: Clutter): string => `translate(${this.getX(o)}px,${this.getY(o)}px)`;
  @Input() moveTransition = (transition?: number): string => {
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
      '.2s ease', // defenduck spin
    ][b.rotateTransition] || '';
  }

  constructor(protected ws: WsService) { }

  ngOnInit(): void {
    document.addEventListener('visibilitychange', this.visibilityChange);

    this.subs.add(this.ws.subscribe(Internal.ResetBoats, () => this.resetBoats()));
    this.subs.add(this.ws.subscribe(Internal.Lobby, (m: Lobby) => {
      if (!m.boats) return;
      clearTimeout(this.animateTimeout);
      clearTimeout(this.animateTimeout2);
      clearTimeout(this.animateTimeout3);
      delete this.animateTimeout;
      delete this.turn;
      this.myBoat.isMe = this._boats[this.myBoat.id] === this.myBoat;
      this.setBoats(Object.values(m.boats));
      m.boats = this.boats.map(boatToSync) as any;
      this.clutter = [];
      const clutter = m.clutter || [];
      this.handleUpdate(clutter, 0);
      setTimeout(() => {
        this.handleTurn(m as any);
      }, 100);
    }));
    this.subs.add(this.ws.subscribe(InCmd.NewBoat, (boat: BoatSync) => this.setBoats([boat], false)));
    this.subs.add(this.ws.subscribe(InCmd.DelBoat, (id: number) => this.deleteBoat(id)));
    this.subs.add(this.ws.subscribe(InCmd.Moves, s => this.handleMoves(s)));
    this.subs.add(this.ws.subscribe(InCmd.Ready, id => {
      const boat = this._boats[id];
      if (boat) boat.ready = true;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Bomb, b => {
      const boat = this._boats[b.t];
      if (boat) boat.bomb = b.m;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Turn, (t) => this.handleTurn(t)));
    this.subs.add(this.ws.subscribe(InCmd.Sync, this.syncBoats));
    this.subs.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));
  }

  ngOnDestroy(): void {
    clearTimeout(this.animateTimeout);
    clearTimeout(this.animateTimeout2);
    clearTimeout(this.animateTimeout3);
    delete this.animateTimeout;
    document.removeEventListener('visibilitychange', this.visibilityChange);
    this.subs.unsubscribe();
  }

  protected handleMoves(s: { t: number, m: number[], s?: number[] }): void {
    if (Array.isArray(s)) {
      for (const part of s) this.handleMoves(part);
      return;
    }
    const boat = this._boats[s.t];
    if (boat) {
      boat.moves = s.m;
      boat.shots = s.s || [];
    }
  }

  protected deleteBoat(id: number): void {
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
      if (!this.turn) return;
      clearTimeout(this.animateTimeout);
      clearTimeout(this.animateTimeout2);
      clearTimeout(this.animateTimeout3);
      delete this.animateTimeout;
      TWEEN.update(Infinity);
      BoatRender.tweens.update(Infinity);
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
      this.ws.dispatchMessage({ cmd: Internal.ResetMoves });
    }
  }

  protected handleTurn(turn: Turn): void {
    if (this.turn || !turn.steps) {
      // console.log('got turn while in turn', this.turn);
      return;
    }
    BoatRender.tweens.update(Infinity);
    clearTimeout(this.animateTimeout);
    clearTimeout(this.animateTimeout2);
    clearTimeout(this.animateTimeout3);
    delete this.animateTimeout;
    // first turn is only for starting the entry
    if (turn.turn === 0) {
      setTimeout(() => {
        for (const boat of this.boats) boat.ready = false;
        this.ws.dispatchMessage({ cmd: Internal.ResetMoves });
      }, 1000);
      return;
    }

    this.turn = turn;
    this.step = 0;

    let moveFound = false;
    for (const step of turn.steps) if (step) moveFound = true;
    if (!moveFound) for (const step of turn.cSteps) if (step && step.length) moveFound = true;

    if (!moveFound || this.blurred) {
      this.resetBoats();
      this.animateTimeout = window.setTimeout(() => this.ws.send(OutCmd.Sync), 1000);
      delete this.turn;
      return;
    }

    for (const boat of this.boats) boat.ready = true;
    this.animateTimeout = window.setTimeout(this.playTurn.bind(this), 100);
  }

  protected resetBoats(): void {
    for (const boat of this.boats) {
      boat.moves = [0, 0, 0, 0];
      boat.bomb = 0;
    }
    setTimeout(() => this.ws.dispatchMessage({ cmd: Internal.ResetMoves }));
  }

  protected playTurn(): void {
    const clutterPart = this.turn?.cSteps[this.step] || [];
    this.animateTimeout2 = window.setTimeout(() => this.handleUpdate(clutterPart, this.step), 10000 / this.speed);
    const turnPart = this.turn?.steps[this.step] || [];
    for (const u of turnPart) {
      const boat = this._boats[u.id];
      if (!boat) continue;
      if (u.c) boat.addDamage(u.c - 1, u.cd || 0);

      if (u.tm === undefined || u.tf === undefined) continue;
      if (boat.rotateTransition === 0) boat.rotateTransition = 1;
      boat.setTreasure(u.t)
        .setPos(u.x, u.y)
        .setTransition(u.tf, u.tm)
        .draw();

      if (u.s) {
        boat.face += boat.spinDeg * u.s;
        if (u.s > -2) {
          boat.rotateTransition = 4;
          this.animateTimeout3 = window.setTimeout(() => {
            if (u.tm) boat.rotateByMove(u.tm).rotateTransition = 1;
          }, 300);
        } else {
          boat.rotateByMove(u.tm).rotateTransition = 3;
        }
      } else boat.rotateByMove(u.tm);
    }

    if (this.step === 4) this.resetBoats();

    this.step++;
    const delay = (this.turn?.steps[this.step] || this.turn?.cSteps[this.step] ? 750 : 250) * 20 / this.speed;
    if (this.step < 8) this.animateTimeout = window.setTimeout(() => this.playTurn(), delay);
    else this.animateTimeout = window.setTimeout(() => this.ws.send(OutCmd.Sync), 2500);
  }

  trackBoatBy(_i: number, b: Boat): number {
    return b.id;
  }

  private syncBoats = (sync: Sync) => {
    if (!sync) return;
    clearTimeout(this.animateTimeout);
    clearTimeout(this.animateTimeout2);
    clearTimeout(this.animateTimeout3);
    delete this.animateTimeout;
    delete this.turn;
    this.step = -1;

    this.animateTimeout2 = window.setTimeout(() => {
      this.clutter = [];
      const clutter = sync.cSync || [];
      this.handleUpdate(clutter, 0);
    }, 1000);
    if (sync.sync) {
      this.setBoats(sync.sync);
      for (const boat of this.boats) {
        boat.ready = false;
      }
    }
  }

  protected sortBoats(): void {
    this.boats.sort((a, b) => {
      if (a.pos.y > b.pos.y) return 1;
      if (a.pos.y < b.pos.y) return -1;
      return b.pos.x - a.pos.x;
    });
  }

  protected setBoats(boats: BoatSync[], reset = true): void {
    const newBoats: Record<number, Boat> = {};
    if (!reset) Object.assign(newBoats, this._boats);
    // if (this.turn && boats.length > 1) return console.log('skipped boat set');
    for (const sBoat of boats) {
      if (sBoat.oId) delete this._boats[sBoat.oId];
      let boat = this._boats[-sBoat.id] || this._boats[sBoat.id];
      if (!boat || boat.name !== sBoat.n) boat = new Boat(sBoat.n, sBoat.ty, sBoat.id === this.ws.sId);
      const id = this.turn ? -sBoat.id : sBoat.id;
      newBoats[id] = boat;
      if (boat.isMe && sBoat.team !== undefined && sBoat.team !== this.myBoat.team) {
        this.myBoat = new Boat('');
      }
      syncToBoat(boat, sBoat);

      if (!boat.isMe || !this.ws.connected) continue;
      if (boat === this.myBoat) {
        if (boat.oId !== this.myBoat.oId) this.myBoat.moves = [0, 0, 0, 0];
        if (this.myBoat.damage >= this.myBoat.maxDamage) {
          this.myBoat.damage = 0;
          setTimeout(() => {
            console.log('sunk boat refresh');
            this.ws.dispatchMessage({ cmd: Internal.MyBoat, data: this.myBoat });
            this.map?.dispatchEvent(new Event('dblclick'));
          });
        }
        continue;
      }
      setTimeout(() => {
        this.ws.dispatchMessage({ cmd: Internal.MyBoat, data: boat });
        // console.log('new boat refresh');
        this.map?.dispatchEvent(new Event('dblclick'));
      });
      this.myBoat = boat;
    }
    this._boats = newBoats;
    this.boats = Object.values(this._boats);
    if (!this.ws.connected) this.ws.dispatchMessage({ cmd: Internal.Boats, data: this.boats });
    this.sortBoats();

    const sId = this.ws.sId || 0;
    if (this.myBoat.isMe && !this._boats[sId] && !this._boats[-sId]) {
      this.myBoat = new Boat('');
      this.ws.dispatchMessage({ cmd: Internal.MyBoat, data: this.myBoat });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected handleUpdate(updates: Clutter[], _: number): void {
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
