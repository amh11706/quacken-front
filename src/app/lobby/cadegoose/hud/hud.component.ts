import { Component, Input } from '@angular/core';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { KeyActions } from 'src/app/settings/key-binding/key-actions';
import { KeyBindingService } from 'src/app/settings/key-binding/key-binding.service';
import { SettingsService } from 'src/app/settings/settings.service';
import { InCmd, Internal, OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { Boat } from '../../quacken/boats/boat';
import { HudComponent, BoatTick } from '../../quacken/hud/hud.component';

export interface MoveMessage {
  moves: number[];
  shots: number[];
}

@Component({
  selector: 'q-cade-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss']
})
export class CadeHudComponent extends HudComponent {
  @Input() kbControls = 0;
  @Input() protected moveKeys: Record<number, KeyActions> = {
    0: KeyActions.CBlank,
    1: KeyActions.CLeft,
    2: KeyActions.CForward,
    3: KeyActions.CRight,
  } as const;
  @Input() protected actions = {
    bombLeft: KeyActions.CBombLeft,
    bombRight: KeyActions.CBombRight,
    BombLeftStrict: KeyActions.CBombLeftStrict,
    BombRightStrict: KeyActions.CBombRightStrict,
    prevSlot: KeyActions.CPrevSlot,
    nextSlot: KeyActions.CNextSlot,
    ready: KeyActions.Noop,
    back: KeyActions.CBack,
  };
  protected secondsPerTurn = 30;
  protected maxTurn = 75;
  shots = [0, 0, 0, 0, 0, 0, 0, 0];
  moves = [0, 0, 0, 0];
  haveMoves = [2, 4, 2];
  usingMoves = [0, 0, 0];
  tokenStrings = ['', '', ''];
  lastTick: BoatTick = { tp: 0 } as BoatTick;
  usingCannons = 0;
  newTurn = false;

  wantMove = 2;
  auto = true;

  constructor(ws: WsService, fs: FriendsService, private ss: SettingsService, kbs: KeyBindingService) {
    super(ws, fs, kbs);
  }

  ngOnInit() {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(Internal.MyBoat, (boat: Boat) => {
      this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
    }));
    this.subs.add(this.ws.subscribe(Internal.MyMoves, (moves: MoveMessage) => {
      this.moves = [...moves.moves];
      this.usingMoves = [0, 0, 0];
      for (const m of this.moves) if (m) this.usingMoves[m - 1]++;
      if (!moves.shots) return;
      this.shots = [...moves.shots];
      this.usingCannons = this.shots.reduce((acc, cur) => acc + cur, 0);
    }));
    this.subs.add(this.ws.subscribe(InCmd.Turn, () => {
      this.newTurn = true;
    }));
    this.subs.add(this.ws.subscribe(InCmd.BoatTick, (t: BoatTick) => {
      if (this.newTurn) {
        this.usingCannons = 0;
        this.usingMoves = [0, 0, 0];
        this.newTurn = false;
      }
      this.lastTick = t;
      const hadMoves = this.haveMoves;
      if (t.t) {
        this.haveMoves = [0, 0, 0];
        for (let i = 0; i < t.t.length; i++) {
          this.tokenStrings[i] = t.t[i].join(', ');
          for (const count of t.t[i]) this.haveMoves[i] += count;
        }
      }

      if (this.auto && (this.haveMoves[0] !== hadMoves[0] || this.haveMoves[1] !== hadMoves[1] || this.haveMoves[2] !== hadMoves[2])) {
        this.setAutoWant();
      }
    }));
  }

  protected eraseSlot(slot: number) {
    super.eraseSlot(slot);
    const usedCannons = this.usingCannons;
    this.usingCannons -= this.shots[slot * 2] + this.shots[slot * 2 + 1];
    if (usedCannons > this.usingCannons) {
      this.shots[slot * 2] = 0;
      this.shots[slot * 2 + 1] = 0;
      this.ws.send(OutCmd.Shots, this.shots);
    }
  }

  setBomb(i: number, strict = false) {
    if (i === 0) {
      this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
      this.usingCannons = 0;
      this.ws.send(OutCmd.Shots, this.shots);
      return;
    }

    i--;
    const side = Math.floor(i / 4);
    let adjusted = (i % 4) * 2 + side;
    while (!strict && this.shots[adjusted] === this.myBoat.maxShots && adjusted < 6) adjusted += 2;
    this.addShot(adjusted);
  }

  changeWantMove() {
    if (this.auto) this.setAutoWant();
    else this.ws.send(OutCmd.WantMove, this.wantMove);
  }

  sendReady() {
    this.ws.send(OutCmd.Ready);
  }

  imReady() {
  }

  private setAutoWant() {
    let min = 255;
    for (const move of [1, 0, 2]) {
      if (this.haveMoves[move] < min) {
        min = this.haveMoves[move];
        this.wantMove = move + 1;
      }
    }
    this.ws.send(OutCmd.WantMove, this.wantMove);
  }

  clickTile(ev: MouseEvent, slot: number) {
    if (this.locked) return;
    const moves = this.getMoves();
    const move = moves[slot];
    if (move === 0 && this.maxMoves) return;
    let wantMove = (ev.button + 1 + move) % 4;
    while (wantMove !== 0 && this.haveMoves[wantMove - 1] - this.usingMoves[wantMove - 1] <= 0) {
      wantMove = (ev.button + 1 + wantMove) % 4;
    }
    moves[slot] = wantMove;
    this.checkMaxMoves();
    this.sendMoves();
  }

  checkMaxMoves() {
    this.usingMoves = [0, 0, 0];
    if (!this.locked) for (let i = 0; i < this.moves.length; i++) {
      const move = this.moves[i];
      if (move === 0) continue;
      if (this.haveMoves[move - 1] > this.usingMoves[move - 1]) this.usingMoves[move - 1]++;
      else this.moves[i] = 0;
    }
    super.checkMaxMoves();
  }

  addShot(i: number) {
    if (this.locked) return;
    const oldShots = this.shots[i];
    this.shots[i] = (oldShots + 1) % ((this.myBoat.maxShots || 1) + 1);
    this.usingCannons += this.shots[i] - oldShots;
    if (this.usingCannons > this.lastTick.tp) {
      this.usingCannons -= this.shots[i];
      this.shots[i] = 0;
    }
    this.ws.send(OutCmd.Shots, this.shots);
  }

  protected getMoves(): number[] {
    return this.moves;
  }

  protected resetMoves() {
    super.resetMoves();
    for (let i = 0; i < this.usingMoves.length; i++) this.haveMoves[i] -= this.usingMoves[i];
    this.usingMoves = [0, 0, 0];
    this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
    this.usingCannons = 0;
  }

  async setTurn(turn: number, sec: number = this.secondsPerTurn - 1) {
    const old = this.secondsPerTurn;
    this.secondsPerTurn = (await this.ss.get('l/cade', 'turnTime')).value;
    super.setTurn(turn, sec + this.secondsPerTurn - old);
  }
}
