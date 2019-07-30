import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../ws.service';
import { Boat } from './boat';

export interface Clutter {
  t: number,
  x: number,
  y: number,
  d?: number,
  p?: boolean,
}

interface Turn {
  turn: number,
  steps: BoatStatus[][],
  cSteps: Clutter[][],
  treasure: number[],
}

interface Sync {
  sync: BoatSync[],
  cSync: Clutter[],
}

interface BoatStatus {
  id: number,
  x: number,
  y: number,
  t: number,
  tf: number,
  tm: number,
  c?: number,
  cd?: number,
}

interface BoatSync extends BoatStatus {
  n: string,
  f: number,
  m: number[],
  d: number,
  b: number,
  tp: number,
  ty: number,
}

@Component({
  selector: 'app-boats',
  templateUrl: './boats.component.html',
  styleUrls: ['./boats.component.css']
})
export class BoatsComponent implements OnInit, OnDestroy {
  @Input() speed: number;
  @Input() map: HTMLElement;
  clutterTypes = [
    'powderkeg',
    'mine',
    'feathers',
    'bread',
    'head',
  ];
  clutter: Clutter[] = [];
  moveTransitions = [
    '0s linear',
    's linear',
    's ease-in',
    's ease-out',
    '.1s linear'  // crunch
  ];
  rotateTransitions = [
    '0s linear',
    '.4s ease .1s', // normal rotate
    '3s linear' // sink rotate
  ];
  szFade = ', opacity .8s linear .7s';
  moveNames = ['', 'left', 'forward', 'right'];
  titles = ['', ', Cuttle Cake', ', Taco Locker', ', Pea Pod', ', Fried Egg'];

  myBoat = new Boat('');
  boats: Boat[] = [];
  private _boats: any = {};
  private subs: Subscription;
  private animateTimeout: number;
  private blurred = false;
  private step = -1;
  private turn: Turn;

  constructor(private ws: WsService) { }

  ngOnInit() {
    document.addEventListener('visibilitychange', this.visibilityChange);

    this.subs = this.ws.subscribe('joinLobby', m => {
      clearTimeout(this.animateTimeout);
      this.boats = [];
      this._boats = {};
      this.setBoats(Object.values(m.boats));
      this.clutter = m.clutter;
    });
    this.subs.add(this.ws.subscribe('newBoat', (boat: BoatSync) => this.setBoats([boat])));
    this.subs.add(this.ws.subscribe('delBoat', (id: number) => {
      delete this._boats[id];
      this.boats = Object.values(this._boats);
    }));
    this.subs.add(this.ws.subscribe('s', s => {
      const boat = this._boats[s.t];
      if (boat) boat.moves = s.m;
    }));
    this.subs.add(this.ws.subscribe('r', id => {
      const boat = this._boats[id];
      if (boat) boat.ready = true;
    }));
    this.subs.add(this.ws.subscribe('b', b => {
      const boat = this._boats[b.t];
      if (boat) boat.bomb = b.m;
    }));
    this.subs.add(this.ws.subscribe('turn', turn => this.handleTurn(turn)));
    this.subs.add(this.ws.subscribe('sync', sync => this.syncBoats(sync)));
  }

  ngOnDestroy() {
    clearTimeout(this.animateTimeout);
    document.removeEventListener('visibilitychange', this.visibilityChange);
    if (this.subs) this.subs.unsubscribe();
  }

  trackBy(_i: number, c: Clutter): string {
    return c.x + ',' + c.y;
  }

  private visibilityChange = () => {
    this.blurred = document.hidden;

    if (this.blurred) {
      clearTimeout(this.animateTimeout);
      if (this.step >= 0) {
        for (let boat of this.boats) {
          boat.moves = [0, 0, 0, 0];
          boat.bomb = 0;
          boat.ready = false;
        }
        if (this.turn.turn <= 90) this.ws.dispatchMessage({ cmd: 'unlockMoves' });
      }
      this.ws.send('sync');
      this.step = -1;
    } else if (this.turn) {
      this.ws.send('sync');
      clearTimeout(this.animateTimeout);
    }
  }

  private handleTurn(turn: Turn) {
    // first turn is only for starting the entry
    if (turn.turn === 1) {
      setTimeout(() => {
        for (const boat of this.boats) boat.ready = false;
        this.ws.dispatchMessage({ cmd: 'unlockMoves' });
      }, 1000);
      return;
    }

    this.turn = turn;
    this.step = 0;
    clearTimeout(this.animateTimeout);

    let moveFound = false;
    for (const step of turn.steps) if (step) moveFound = true;

    if (!moveFound || this.blurred) {
      this.resetBoats();
      setTimeout(() => this.ws.send('sync'), 1000);
      return;
    }

    for (let boat of this.boats) boat.ready = true;
    this.playTurn();
  }

  private resetBoats(): void {
    for (const boat of this.boats) {
      boat.moves = [0, 0, 0, 0];
      boat.bomb = 0;
    }
    if (this.turn.turn <= 90) this.ws.dispatchMessage({ cmd: 'unlockMoves' });
  }

  private playTurn = () => {
    const clutterPart = this.turn.cSteps[this.step] || [];
    setTimeout(() => this.handleUpdate(clutterPart), 1000 / this.speed);
    const turnPart = this.turn.steps[this.step] || [];
    for (const u of turnPart) {
      const boat = this._boats[u.id];
      if (!boat) continue;

      if (u.c > 0) boat.addDamage(u.c - 1, u.cd || 0);
      if (u.tm) boat.face += u.tm * 90 - 180;
      boat.treasure = u.t;
      boat.rotateTransition = 1;
      boat.setPos(u.x, u.y).setTransition(u.tf, u.tm).draw();
    }

    if (this.step === 5) this.resetBoats()

    this.step++;
    const delay = (this.turn.steps[this.step] ? 750 : 250) * 2 / this.speed;
    if (this.step < 8) this.animateTimeout = window.setTimeout(this.playTurn, delay);
    else this.animateTimeout = window.setTimeout(() => this.ws.send('sync'), 1500);
  }

  private syncBoats = (sync: Sync) => {
    if (!sync || !this.turn) return;
    this.turn = undefined;
    this.clutter = sync.cSync;
    for (let s of sync.sync) {
      const boat = this._boats[s.id];
      if (!boat) continue;
      if (boat.isMe && boat.damage > s.d) {
        this.map.dispatchEvent(new Event('dblclick'));
      }

      boat.rotateTransition = 0;
      boat.moveTransition = [0, 0];
      boat.enteringSZ = false;
      boat.opacity = 1;
      boat.imageOpacity = 1;

      boat.face = s.f * 90;
      boat.tokenPoints = s.tp;
      boat.treasure = s.t;
      boat.damage = s.d;
      boat.type = s.ty;
      boat.setPos(s.x, s.y, false).draw();
    }

    this.step = -1;
    delete this.turn;
    for (let boat of this.boats) boat.ready = false;
  }

  private setBoats(boats: BoatSync[]) {
    for (const sBoat of boats) {
      const boat = new Boat(sBoat.n, sBoat.id === this.ws.sId, sBoat.m, sBoat.ty)
        .setPos(sBoat.x, sBoat.y)
        .setTreasure(sBoat.t)
        .setDamage(sBoat.d)
        .draw();
      boat.face = sBoat.f * 90;
      boat.bomb = sBoat.b;
      this._boats[sBoat.id] = boat;
      if (boat.isMe) {
        this.ws.dispatchMessage({ cmd: 'myBoat', data: boat });
        this.myBoat = boat;
      }
    }
    this.boats = Object.values(this._boats);
  }

  private handleUpdate(updates: Clutter[]) {
    for (const u of updates) {
      let c = this.clutter.find(c => {
        return c.x === u.x && c.y === u.y;
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
