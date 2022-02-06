import { Component, Input, OnInit } from '@angular/core';
import { KeyActions } from '../../../settings/key-binding/key-actions';
import { InCmd, Internal, OutCmd } from '../../../ws-messages';
import { HudComponent, BoatTick } from '../../quacken/hud/hud.component';

export interface MoveMessage {
  moves: number[];
  shots: number[];
}

@Component({
  selector: 'q-cade-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss'],
})
export class CadeHudComponent extends HudComponent implements OnInit {
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

  maneuverValues = [100, 75, 150, 200];
  usingManeuvers = [0, 0, 0, 0];
  wantManeuver = 0;
  maneuvers = [
    { id: 4, class: 'move bombtoken', title: 'Chain Shot' },
    { id: 8, class: 'move', title: 'In-place Turn' },
    { id: 12, class: 'move', title: 'Double Forward' },
    { id: 16, class: 'move', title: 'Flotsam' },
  ];

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
  protected group = 'l/cade';
  serverShots = [0, 0, 0, 0, 0, 0, 0, 0];

  ngOnInit(): void {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(Internal.MyBoat, () => {
      this.wantMove = 2;
      this.auto = true;
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

      if (this.auto &&
        (this.haveMoves[0] !== hadMoves[0] || this.haveMoves[1] !== hadMoves[1] || this.haveMoves[2] !== hadMoves[2])
      ) {
        this.setAutoWant();
      }
    }));
  }

  protected async eraseSlot(slot: number): Promise<void> {
    super.eraseSlot(slot);
    const usedCannons = this.usingCannons;
    this.usingCannons -= this.shots[slot * 2] + this.shots[slot * 2 + 1];
    if (usedCannons > this.usingCannons) {
      this.shots[slot * 2] = 0;
      this.shots[slot * 2 + 1] = 0;
      this.serverShots = await this.ws.request(OutCmd.Shots, this.shots);
    }
  }

  async bombToken(ev: DragEvent, slot: number): Promise<void> {
    ev.preventDefault();
    if (this.locked || this.move > 7 || this.move < 4) return;
    for (const i in this.shots) if (this.shots[i] > 2) this.shots[i] = 0;
    this.usingCannons -= this.shots[slot];
    this.shots[slot] = this.move;
    this.usingManeuvers[0] = this.move === 4 ? 100 : 200;
    this.move = 0;
    this.serverShots = await this.ws.request(OutCmd.Shots, this.shots);
  }

  async setBomb(i: number, strict = false): Promise<void> {
    if (i === 0) {
      this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
      this.usingCannons = 0;
      this.serverShots = await this.ws.request(OutCmd.Shots, this.shots);
      return;
    }

    i--;
    const side = Math.floor(i / 4);
    let adjusted = (i % 4) * 2 + side;
    if (!strict) while (this.shots[adjusted] === this.myBoat.maxShots && adjusted < 6) adjusted += 2;
    return this.addShot(adjusted);
  }

  changeWantMove(): void {
    if (this.auto) this.setAutoWant();
    else this.ws.send(OutCmd.WantMove, this.wantMove);
  }

  setWantToken(value: number): void {
    this.wantManeuver = value;
    this.ws.send(OutCmd.WantManeuver, this.wantManeuver);
  }

  imReady(): void {
    this.stopTimer();
    this.myBoat.ready = true;
    this.locked = true;
    this.ws.send(OutCmd.Ready, { ready: true, moves: this.getMoves(), shots: this.shots });
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

  clickTile(ev: MouseEvent, slot: number): void {
    if (this.locked || slot === this.blockedPosition) return;
    const moves = this.getMoves();
    const move = moves[slot];
    if ((move === 0 && this.maxMoves) || move > 7) return;
    let wantMove = (ev.button + 1 + move) % 4;
    while (wantMove !== 0 && this.haveMoves[wantMove - 1] - this.usingMoves[wantMove - 1] <= 0) {
      wantMove = (ev.button + 1 + wantMove) % 4;
    }
    moves[slot] = wantMove;
    void this.sendMoves();
  }

  checkMaxMoves(): void {
    this.usingMoves = [0, 0, 0];
    this.usingManeuvers = [0, 0, 0, 0];
    if (!this.locked) {
      for (let i = 0; i < this.moves.length; i++) {
        const move = this.moves[i];
        if (move === 0) continue;
        if (move > 7) {
          const maneuver = Math.floor(move / 4 - 1);
          const points = move % 2 === 0 ? 100 : 200;
          if (this.maneuverValues[maneuver] >= points + this.usingManeuvers[maneuver]) {
            this.usingManeuvers[maneuver] = points;
          } else this.moves[i] = 0;
        } else if (this.haveMoves[move - 1] > this.usingMoves[move - 1]) this.usingMoves[move - 1]++;
        else this.moves[i] = 0;
      }
    }
    super.checkMaxMoves();
  }

  async addShot(i: number): Promise<void> {
    if (this.locked) return;
    const oldShots = this.shots[i];
    this.shots[i] = (oldShots + 1) % ((this.myBoat.maxShots || 1) + 1);
    if (oldShots > 2) {
      this.usingManeuvers[0] = 0;
      this.shots[i] = 0;
    } else this.usingCannons += this.shots[i] - oldShots;
    if (this.usingCannons > this.lastTick.tp) {
      this.usingCannons -= this.shots[i];
      this.shots[i] = 0;
    }
    this.serverShots = await this.ws.request(OutCmd.Shots, this.shots);
  }

  public getMoves(): number[] {
    return this.moves;
  }

  protected resetMoves(): void {
    super.resetMoves();
    for (let i = 0; i < this.usingMoves.length; i++) this.haveMoves[i] -= this.usingMoves[i];
    this.usingMoves = [0, 0, 0];
    this.usingManeuvers = [0, 0, 0, 0];
    this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
    this.usingCannons = 0;
    this.serverMoves = [...this.getMoves()];
    this.serverShots = [...this.shots];
  }

  async setTurn(turn: number, sec: number = this.secondsPerTurn - 1): Promise<void> {
    const old = this.secondsPerTurn;
    await this.ss.get('l/cade', 'turnTime');
    super.setTurn(turn, sec + this.secondsPerTurn - old);
  }

  disengage(side = 0): void {
    this.ws.send(OutCmd.SpawnSide, side);
    void this.ss.getGroup('boats').then(settings => settings.spawnSide.value = side);
  }
}
