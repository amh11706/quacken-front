import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { WsService } from '../../../ws.service';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { Boat } from '../boats/boat';
import { Turn } from '../boats/boats.component';
import { Lobby } from '../../lobby.component';

export const weapons = [
  '', '', 'powderkeg', '', '', '', '', '', '', '',
  '', '', '', 'spin',
];

export interface BoatTick {
  t: [number[], number[], number[]];
  d: number;
  b: number;
  tp: number;
}

@Component({
  selector: 'q-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.css']
})
export class HudComponent implements OnInit, OnDestroy {
  @Input() kbControls = 1;
  keys: { [key: string]: number } = {
    'ArrowLeft': 1, 'KeyA': 1,
    'ArrowUp': 2, 'KeyW': 2,
    'ArrowRight': 3, 'KeyD': 3,
    'ArrowDown': 0, 'KeyS': 0,
    'KeyX': 4,
  };
  tokens = [
    '', '', '', '', '', '', '', '', '', '',
    'duckpoo', 'duckpoo', 'duckpoo', 'duckpoo',
  ];
  weapons = weapons;

  document = document;
  myBoat = new Boat('');

  locked = true;
  maxMoves = false;
  selected = 0;
  turn = 0;

  private source = 4;
  private move = 0;
  protected subs = new Subscription();

  private timeInterval?: number;
  private minutes = 0;
  private seconds = 0;
  protected turnSeconds = 0;
  protected secondsPerTurn = 20;
  protected maxTurn = 90;

  seconds$ = new BehaviorSubject<number>(76);

  constructor(protected ws: WsService, public fs: FriendsService) { }

  ngOnInit() {
    document.addEventListener('keydown', this.kbEvent);
    this.subs = this.ws.subscribe('_myBoat', (b: Boat) => {
      this.myBoat = b;
      this.checkMaxMoves();
      this.ws.send('boatTick');
    });
    this.subs.add(this.ws.subscribe('_unlockMoves', () => {
      if (!this.turn || this.turn > this.maxTurn) return;
      this.resetMoves();
      this.locked = false;
      if (this.selected !== -1) this.selected = 0;
    }));
    this.subs.add(this.ws.subscribe('boatTick', (t: BoatTick) => {
      this.myBoat.damage = t.d;
    }));

    this.subs.add(this.ws.subscribe('_boats', (m: Lobby) => {
      this.turn = m.turn ?? this.turn;
      if (this.turn > 0) this.locked = false;
      else {
        this.myBoat.ready = false;
        this.locked = true;
        this.resetMoves();
      }

      if (!this.timeInterval && this.turn > 0 && this.turn < this.maxTurn) this.startTimer();
      else this.stopTimer();
      this.setTurn(this.maxTurn - this.turn, this.secondsPerTurn - (m.seconds || -1) - 2);
    }));

    this.subs.add(this.ws.subscribe('turn', (turn: Turn) => {
      this.stopTimer();
      if (turn.turn <= this.maxTurn) {
        this.turn = turn.turn;
        this.startTimer();
        this.setTurn(this.maxTurn - turn.turn);
      } else {
        this.turn = 0;
      }
      if (turn.turn !== 1) this.locked = true;
      this.checkMaxMoves();
      if (this.myBoat.bomb) this.myBoat.tokenPoints = 0;
      this.ws.send('boatTick');
    }));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.kbEvent);
    if (this.subs) this.subs.unsubscribe();
    this.stopTimer();
  }

  private kbEvent = (e: KeyboardEvent) => {
    const active = document.activeElement;
    if (active?.id === 'textinput' || this.kbControls === 0) return;
    if (active instanceof HTMLElement && active.nodeName !== 'INPUT') active.blur();
    if (e.code === 'Enter' || e.code === 'Space') {
      this.imReady();
      return;
    }
    if (this.locked) return;
    if (e.code === 'Escape') return this.selected = -1;
    if (this.selected === -1) return this.selected = 0;

    if (e.code === 'Backspace' || e.code === 'KeyZ' && e.ctrlKey) {
      if (this.selected > 0 && (this.selected < 3 || this.getMoves()[this.selected] === 0)) {
        this.selected -= 1;
      } else if (this.selected === 0) {
        this.setBomb(0);
        this.resetMoves();
      }
      this.getMoves()[this.selected] = 0;
      this.checkMaxMoves();
      this.sendMoves();
      return;
    }
    if (e.code === 'KeyQ') {
      if (this.selected > 0 && this.getMoves()[this.selected] === 0) {
        return this.setBomb(this.selected);
      }
      return this.setBomb(this.selected + 1);
    }
    if (e.code === 'KeyE') {
      if (this.selected > 0 && this.getMoves()[this.selected] === 0) {
        return this.setBomb(this.selected + 4);
      }
      return this.setBomb(this.selected + 5);
    }

    const move = this.keys[e.code];
    if (typeof move !== 'number') return;
    if (e.shiftKey) {
      if (move === 2) {
        if (this.selected > 0) this.selected -= 1;
      } else if (move === 0) {
        if (this.selected < 3) this.selected += 1;
      } else if (move === 1) {
        this.setBomb(this.selected + 1);
      } else if (move === 3) {
        this.setBomb(this.selected + 5);
      }
    } else {
      const oldMove = this.getMoves()[this.selected];
      if (this.maxMoves && !(move === 0 || move === 4) && (oldMove === 0 || oldMove === 4)) {
        if (this.selected < 3) this.selected += 1;
        return;
      }
      this.getMoves()[this.selected] = move;
      if (this.selected < 3) this.selected += 1;
      this.checkMaxMoves();
      this.sendMoves();
    }
  }

  protected resetMoves() {
    const moves = this.getMoves();
    for (const i in moves) moves[i] = 0;
    this.maxMoves = false;
  }

  checkMaxMoves() {
    if (this.myBoat.maxMoves === 4) {
      this.maxMoves = false;
      return;
    }
    const moveCount = this.getMoves().reduce((a, c) => a + +(c > 0 && c < 4), 0);
    this.maxMoves = moveCount >= 3;
    if (moveCount === 4) this.getMoves()[3] = 0;
  }

  setBomb(i: number) {
    if (this.locked || !this.weapons[this.myBoat.type] || this.myBoat.tokenPoints < 2) return;
    if (this.myBoat.bomb === i) this.myBoat.bomb = 0;
    else this.myBoat.bomb = i;
    this.ws.send('b', this.myBoat.bomb);
  }

  imReady() {
    if (this.myBoat.ready) return;
    this.stopTimer();
    this.myBoat.ready = true;
    this.locked = true;
    this.ws.send('r');
  }

  start() {
    this.ws.send('c/start', '');
  }

  private sendMoves() {
    this.ws.send('s', this.getMoves());
  }

  protected getMoves(): number[] {
    return this.myBoat.moves || [];
  }

  clickTile(ev: MouseEvent, slot: number) {
    this.selected = -1;
    if (this.locked) return;
    const boat = this.myBoat;
    const moves = this.getMoves();
    if (ev.shiftKey && boat.tokenPoints > 1) {
      if (this.getMoves().indexOf(4) >= 0) return;
      moves[slot] = 4;
      this.sendMoves();
      return;
    }
    const move = moves[slot];
    if (boat.type !== 0 && this.maxMoves && (move === 0 || move === 4)) return;
    moves[slot] = (ev.button + 1 + move) % 4;
    this.checkMaxMoves();
    this.sendMoves();
  }

  drag(move: number, slot: number = 4) {
    this.selected = -1;
    this.move = move;
    this.source = slot;
  }

  drop(ev: DragEvent, slot: number) {
    this.selected = -1;
    ev.preventDefault();
    if (this.locked) return;
    const boat = this.myBoat;
    const moves = this.getMoves();
    const move = moves[slot];
    if (boat.type !== 0 && this.maxMoves && this.source > 3 &&
      (move === 0 || move === 4) && this.move < 4) return;

    if (this.source < 4) moves[this.source] = moves[slot];
    moves[slot] = this.move;
    this.checkMaxMoves();
    this.sendMoves();
    this.source = 4;
  }

  dragEnd() {
    if (this.locked || this.source > 3) return;

    this.getMoves()[this.source] = 0;
    this.checkMaxMoves();
    this.sendMoves();
  }

  setTurn(turn: number, sec: number = this.secondsPerTurn - 1) {
    if (turn === this.maxTurn) sec = 0;
    else if (turn < 0) {
      this.endRound();
      return;
    }

    this.minutes = Math.floor(turn / 60 * this.secondsPerTurn);
    this.seconds = (turn * this.secondsPerTurn % 60) + sec;
    this.turnSeconds = sec;
    this.updatetime();
  }

  private endRound(): void {
    this.ws.dispatchMessage({ cmd: 'time', data: '0:00' });
    this.seconds$.next(0);
    this.stopTimer();
  }

  startTimer(ms: number = 1000) {
    clearInterval(this.timeInterval);
    this.timeInterval = window.setInterval(() => this.tickTimer(), ms);
  }

  stopTimer() {
    clearInterval(this.timeInterval);
    delete this.timeInterval;
  }

  private tickTimer() {
    if (this.turn === 0) return this.stopTimer();
    if (this.turnSeconds < 1 || this.minutes + this.seconds === 0) {
      this.imReady();
      return;
    }

    this.seconds--;
    this.updatetime();

    this.turnSeconds--;
    this.seconds$.next(Math.round(this.turnSeconds * 80 / this.secondsPerTurn - 4));
  }

  protected updatetime(): void {
    const seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;
    this.ws.dispatchMessage({ cmd: 'time', data: this.minutes + ':' + seconds });
  }

}
