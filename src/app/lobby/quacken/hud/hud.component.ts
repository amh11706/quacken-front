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
import { SettingsService, SettingMap } from 'src/app/settings/settings.service';
import { EscMenuService } from 'src/app/esc-menu/esc-menu.service';

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
  @Input() protected moveKeys: Record<number, KeyActions> = {
    0: KeyActions.QBlank,
    1: KeyActions.QLeft,
    2: KeyActions.QForward,
    3: KeyActions.QRight,
    4: KeyActions.QToken,
  } as const;
  @Input() protected actions = {
    bombLeft: KeyActions.QBombLeft,
    bombRight: KeyActions.QBombRight,
    BombLeftStrict: KeyActions.QBombLeftStrict,
    BombRightStrict: KeyActions.QBombRightStrict,
    prevSlot: KeyActions.QPrevSlot,
    nextSlot: KeyActions.QNextSlot,
    ready: KeyActions.QReady,
    back: KeyActions.QBack,
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
  serverMoves = [0, 0, 0, 0];
  private source = 4;
  private move = 0;
  protected subs = new Subscription();
  protected group = 'l/quacken';
  protected lobbySettings: SettingMap = { turns: { value: 90 }, turnTime: { value: 30 } };
  protected get maxTurn() { return this.lobbySettings.turns?.value || 90; }
  protected get secondsPerTurn() { return this.lobbySettings.turnTime?.value || 30; }

  private timeInterval?: number;
  private minutes = 0;
  private seconds = 0;
  protected turnSeconds = 0;
  public blockedPosition = 3;
  seconds$ = new BehaviorSubject<number>(76);

  constructor(
    protected ws: WsService,
    public fs: FriendsService,
    protected kbs: KeyBindingService,
    protected ss: SettingsService,
    public es: EscMenuService,
  ) { }

  ngOnInit() {
    this.ss.getGroup(this.group).then(settings => this.lobbySettings = settings);
    this.handleKeys();
    this.subs.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => {
      if (this.turn > 0 && this.ws.connected) this.locked = b.moveLock !== 0;
      this.myBoat = b;
      this.resetMoves();
      if (!b.isMe) {
        this.locked = true;
      }
    }));
    this.subs.add(this.ws.subscribe(Internal.UnlockMoves, () => {
      if (!this.ws.connected || !this.locked || !this.myBoat.isMe || !this.turn || this.turn > this.maxTurn) return;
      this.resetMoves();
      this.locked = this.myBoat.moveLock !== 0;
      this.myBoat.ready = false;
      this.selected = 0;
    }));
    this.subs.add(this.ws.subscribe(InCmd.BoatTick, (t: BoatTick) => {
      this.myBoat.damage = t.d;
    }));

    this.subs.add(this.ws.subscribe(Internal.Lobby, (m: Lobby) => {
      this.turn = m.turn ?? this.turn;
      if (this.turn > 0 && this.myBoat.isMe && this.ws.connected) this.locked = this.myBoat.moveLock !== 0;
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
    this.subs.add(this.ws.subscribe(InCmd.Sync, () => {
      setTimeout(() => {
        if (this.myBoat.moveLock > 1) {
          this.ws.dispatchMessage({
            cmd: InCmd.ChatMessage,
            data: { type: 1, message: 'Unlocking moves in ' + this.myBoat.moveLock + ' turns.' },
          });
        } else if (this.myBoat.moveLock === 1) {
          this.ws.dispatchMessage({
            cmd: InCmd.ChatMessage,
            data: { type: 1, message: 'Unlocking moves next turn.' },
          });
        } else {
          this.locked = !this.myBoat.isMe;
        }
      });
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
    if (this.actions.ready) this.subs.add(this.kbs.subscribe(this.actions.ready, v => {
      if (v && this.kbControls) this.imReady();
    }));

    this.subs.add(this.kbs.subscribe(this.actions.back, v => {
      if (this.locked || !v || !this.kbControls) return;

      if (this.selected > 0 && this.getMoves()[this.selected] === 0) {
        this.selected -= 1;
      } else if (this.selected === 0 && !this.getMoves()[this.selected]) {
        this.setBomb(0);
        this.resetMoves();
      }
      this.eraseSlot(this.selected);
      this.sendMoves();
    }));

    this.subs.add(this.kbs.subscribe(this.actions.BombLeftStrict, v => {
      if (!this.locked && v && this.kbControls) this.setBomb(this.selected + 1, true);
    }));

    this.subs.add(this.kbs.subscribe(this.actions.BombRightStrict, v => {
      if (!this.locked && v && this.kbControls) this.setBomb(this.selected + 5, true);
    }));

    this.subs.add(this.kbs.subscribe(this.actions.bombLeft, v => {
      if (this.locked || !v || !this.kbControls) return;

      if (this.selected > 0 && this.getMoves()[this.selected] === 0) {
        return this.setBomb(this.selected);
      }
      this.setBomb(this.selected + 1);
    }));

    this.subs.add(this.kbs.subscribe(this.actions.bombRight, v => {
      if (this.locked || !v || !this.kbControls) return;

      if (this.selected > 0 && this.getMoves()[this.selected] === 0) {
        return this.setBomb(this.selected + 4);
      }
      this.setBomb(this.selected + 5);
    }));

    for (const [key, value] of Object.entries(this.moveKeys)) {
      this.subs.add(this.kbs.subscribe(value, v => { if (v) this.placeMove(+key); }));
    }

    this.subs.add(this.kbs.subscribe(this.actions.nextSlot, v => { if (v && this.selected < 3 && this.kbControls) this.selected++; }));
    this.subs.add(this.kbs.subscribe(this.actions.prevSlot, v => { if (v && this.selected > 0 && this.kbControls) this.selected--; }));
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
    if (move === 0) this.blockedPosition = this.selected;
    if (this.selected < 3) this.selected += 1;
    this.sendMoves();
  }

  protected resetMoves() {
    const moves = this.getMoves();
    for (const i in moves) moves[i] = 0;
    this.maxMoves = false;
    this.blockedPosition = this.myBoat.maxMoves === 4 ? 4 : 3;
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

  setBomb(i: number, strict = false) {
    if (this.locked || !this.weapons[this.myBoat.type] || this.myBoat.tokenPoints < 2) return;
    if (this.myBoat.bomb === i) this.myBoat.bomb = 0;
    else this.myBoat.bomb = i;
    this.ws.request(OutCmd.Bomb, this.myBoat.bomb);
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

  protected async sendMoves() {
    this.checkMaxMoves();
    this.serverMoves = await this.ws.request(OutCmd.Moves, this.getMoves());
  }

  public getMoves(): number[] {
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
    this.sendMoves();
  }

  drag(move: number, slot: number = 4) {
    this.move = move;
    this.source = slot;
  }

  drop(ev: DragEvent, slot: number) {
    ev.preventDefault();
    if (this.locked) return;
    const moves = this.getMoves();
    const move = moves[slot];
    if (this.move === 0) this.blockedPosition = slot;
    else if (this.source < 4 && this.blockedPosition === slot) this.blockedPosition = this.source;

    if (this.maxMoves && this.source > 3 && (move === 0 || move === 4) && this.move < 4) return;
    if (this.source < 4) moves[this.source] = moves[slot];
    moves[slot] = this.move;
    this.sendMoves();
    this.source = 4;
  }

  dragEnd() {
    if (this.locked || this.source > 3) return;

    this.getMoves()[this.source] = 0;
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
