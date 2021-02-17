import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { WsService } from '../../../ws.service';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { Boat } from '../boats/boat';
import { Turn } from '../boats/boats.component';
import { Lobby } from '../../lobby.component';
import { InCmd, Internal, OutCmd } from 'src/app/ws-messages';
import { KeyBindingService } from 'src/app/settings/key-binding/key-binding.service';
import { KeyActions } from 'src/app/settings/key-binding/key-actions';

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
  styleUrls: ['./hud.component.scss']
})
export class HudComponent implements OnInit, OnDestroy {
  @Input() kbControls = 1;
  keys: { [key: string]: number } = {
    [KeyActions.Left]: 1,
    [KeyActions.Forward]: 2,
    [KeyActions.Right]: 3,
    [KeyActions.Blank]: 0,
    [KeyActions.Token]: 4,
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

  constructor(
    protected ws: WsService,
    public fs: FriendsService,
    protected kbs: KeyBindingService,
  ) { }

  ngOnInit() {
    this.handleKeys();
    this.subs.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => {
      if (this.turn > 0) this.locked = false;
      this.myBoat = b;
      this.checkMaxMoves();
      if (!b.isMe) {
        this.resetMoves();
        this.locked = true;
      }
    }));
    this.subs.add(this.ws.subscribe(Internal.UnlockMoves, () => {
      if (!this.locked || !this.myBoat.isMe || !this.turn || this.turn > this.maxTurn) return;
      this.resetMoves();
      this.locked = false;
      this.myBoat.ready = false;
      this.selected = 0;
    }));
    this.subs.add(this.ws.subscribe(InCmd.BoatTick, (t: BoatTick) => {
      this.myBoat.damage = t.d;
    }));

    this.subs.add(this.ws.subscribe(Internal.Boats, (m: Lobby) => {
      this.turn = m.turn ?? this.turn;
      if (this.turn > 0 && this.myBoat.isMe) this.locked = false;
      else {
        this.myBoat.ready = false;
        this.locked = true;
        this.resetMoves();
      }

      if (!this.timeInterval && this.turn > 0 && this.turn < this.maxTurn) this.startTimer();
      else this.stopTimer();
      this.setTurn(this.maxTurn - this.turn, this.secondsPerTurn - (m.seconds || -1) - 2);
    }));

    this.subs.add(this.ws.subscribe(InCmd.Turn, (turn: Turn) => {
      this.stopTimer();
      if (turn.turn <= this.maxTurn) {
        this.turn = turn.turn;
        this.startTimer();
        this.setTurn(this.maxTurn - turn.turn);
      } else {
        this.turn = 0;
      }
      if (turn.turn !== 1) this.locked = true;
      if (this.myBoat.bomb) this.myBoat.tokenPoints = 0;
    }));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.stopTimer();
  }

  protected eraseSlot(slot: number) {
    this.getMoves()[slot] = 0;
  }

  private handleKeys() {
    this.subs.add(this.kbs.subscribe(KeyActions.Ready, v => {
      if (v && this.kbControls) this.imReady();
    }));

    this.subs.add(this.kbs.subscribe(KeyActions.Back, v => {
      if (this.locked || !v || !this.kbControls) return;

      if (this.selected > 0 && this.getMoves()[this.selected] === 0) {
        this.selected -= 1;
      } else if (this.selected === 0 && !this.getMoves()[this.selected]) {
        this.setBomb(0);
        this.resetMoves();
      }
      this.eraseSlot(this.selected);
      this.checkMaxMoves();
      this.sendMoves();
    }));

    this.subs.add(this.kbs.subscribe(KeyActions.BombLeft, v => {
      if (this.locked || !v || !this.kbControls) return;

      if (this.selected > 0 && this.getMoves()[this.selected] === 0) {
        return this.setBomb(this.selected);
      }
      this.setBomb(this.selected + 1);
    }));

    this.subs.add(this.kbs.subscribe(KeyActions.BombRight, v => {
      if (this.locked || !v || !this.kbControls) return;

      if (this.selected > 0 && this.getMoves()[this.selected] === 0) {
        return this.setBomb(this.selected + 4);
      }
      this.setBomb(this.selected + 5);
    }));

    this.subs.add(this.kbs.subscribe(KeyActions.Left, v => { if (v) this.placeMove(this.keys[KeyActions.Left]); }));
    this.subs.add(this.kbs.subscribe(KeyActions.Forward, v => { if (v) this.placeMove(this.keys[KeyActions.Forward]); }));
    this.subs.add(this.kbs.subscribe(KeyActions.Right, v => { if (v) this.placeMove(this.keys[KeyActions.Right]); }));
    this.subs.add(this.kbs.subscribe(KeyActions.Blank, v => { if (v) this.placeMove(this.keys[KeyActions.Blank]); }));
    this.subs.add(this.kbs.subscribe(KeyActions.Token, v => { if (v) this.placeMove(this.keys[KeyActions.Token]); }));

    this.subs.add(this.kbs.subscribe(KeyActions.NextSlot, v => { if (v && this.selected < 3 && this.kbControls) this.selected++; }));
    this.subs.add(this.kbs.subscribe(KeyActions.PrevSlot, v => { if (v && this.selected > 0 && this.kbControls) this.selected--; }));
  }

  private placeMove(move: number) {
    if (this.locked || !this.kbControls) return;

    const moves = this.getMoves();
    const oldMove = moves[this.selected];
    if (this.maxMoves && !(move === 0 || move === 4) && (oldMove === 0 || oldMove === 4)) {
      if (this.selected < 3) this.selected += 1;
      return;
    }
    moves[this.selected] = move;
    if (this.selected < 3) this.selected += 1;
    this.checkMaxMoves();
    this.sendMoves();
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
    this.ws.send(OutCmd.Bomb, this.myBoat.bomb);
  }

  imReady() {
    this.stopTimer();
    this.myBoat.ready = true;
    this.locked = true;
    this.ws.send(OutCmd.Ready);
  }

  start() {
    this.ws.send(OutCmd.ChatCommand, '/start');
  }

  protected sendMoves() {
    this.ws.send(OutCmd.Moves, this.getMoves());
  }

  protected getMoves(): number[] {
    return this.myBoat.moves || [];
  }

  clickTile(ev: MouseEvent, slot: number) {
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
    this.move = move;
    this.source = slot;
  }

  drop(ev: DragEvent, slot: number) {
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

    const remaining = this.secondsPerTurn * turn + sec;
    this.minutes = Math.floor(remaining / 60);
    this.seconds = remaining % 60;
    this.turnSeconds = sec;
    this.updatetime();
  }

  private endRound(): void {
    this.ws.dispatchMessage({ cmd: Internal.Time, data: '0:00' });
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
    if (this.seconds < 0) {
      this.seconds += 60;
      this.minutes--;
    }
    this.turnSeconds--;
    this.updatetime();
  }

  protected updatetime(): void {
    this.seconds$.next(Math.round(this.turnSeconds * 76 / this.secondsPerTurn) - 4);
    const seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;
    this.ws.dispatchMessage({ cmd: Internal.Time, data: this.minutes + ':' + seconds });
  }

}
