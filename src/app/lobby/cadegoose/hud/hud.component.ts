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
  lastTick = { tp: 0, attr: {} } as BoatTick;
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
      this.checkMaxMoves();
      if (!moves.shots) return;
      this.shots = [...moves.shots];
      this.checkMaxShots();
    }));
    this.subs.add(this.ws.subscribe(InCmd.Turn, () => {
      this.newTurn = true;
    }));
    this.subs.add(this.ws.subscribe(InCmd.BoatTick, (t: BoatTick) => {
      if (this.newTurn) {
        this.usingCannons = 0;
        this.usingMoves = [0, 0, 0];
        this.usingManeuvers = [0, 0, 0, 0];
        this.newTurn = false;
      }
      if (!t.attr) t.attr = {};
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

  protected eraseSlot(slot: number): void {
    super.eraseSlot(slot);
    this.shots[slot * 2] = 0;
    this.shots[slot * 2 + 1] = 0;
    void this.sendShots();
  }

  setBomb(i: number, strict = false): void {
    if (i === 0) {
      this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
      void this.sendShots();
      return;
    }

    i--;
    const side = Math.floor(i / 4);
    let adjusted = (i % 4) * 2 + side;
    if (!strict) while (this.shots[adjusted] === this.myBoat.maxShots && adjusted < 6) adjusted += 2;
    this.addShot({} as MouseEvent, adjusted);
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

  dragManeuver(token: number): void {
    if (token >= 8) return this.drag(token);
    this.dragCannon(token);
  }

  dragCannon(token: number, slot = 8): void {
    if (token > 5) token -= 2;
    if (token < 4) token = 6;
    this.draggedMove = token;
    this.source = slot;
  }

  dragendCannon(): void {
    const shot = this.shots[this.source];
    if (shot >= 6 || shot === 2) this.shots[this.source] = 1;
    else this.shots[this.source] = 0;
    void this.sendShots();
  }

  dropCannon(slot: number): void {
    if (this.locked) return;
    const oldShots = this.shots[slot];
    const isChain = this.draggedMove !== 6;
    if (isChain) {
      this.shots[slot] = oldShots ? this.draggedMove + 2 : this.draggedMove;
    } else if (oldShots === 2 || oldShots >= 6) {
      return;
    } else {
      this.shots[slot] += oldShots >= 4 ? 2 : 1;
    }
    this.draggedMove = 0;
    setTimeout(this.sendShots.bind(this));
  }

  private checkMaxShots() {
    if (this.locked) return;
    this.usingCannons = 0;
    this.usingManeuvers[0] = 0;
    for (let i = 0; i < this.shots.length; i++) {
      let shot = this.shots[i];
      if (shot === 0) continue;
      const usingManeuver = shot >= 4;
      if (usingManeuver) {
        const points = shot % 2 === 0 ? 100 : 200;
        if (this.lastTick.attr[0] >= points + this.usingManeuvers[0]) {
          this.usingManeuvers[0] = points;
        } else this.shots[i] = 0;
        if (shot < 6) continue;
        shot = 1;
      }
      if (shot > this.lastTick.tp - this.usingCannons) {
        this.shots[i] = 0;
      } else {
        this.usingCannons += shot;
      }
    }
  }

  private async sendShots(): Promise<void> {
    this.checkMaxShots();
    if (this.arrayEqual(this.serverShots, this.shots)) return;
    this.serverShots = await this.ws.request(OutCmd.Shots, this.shots);
  }

  clickTile(ev: MouseEvent, slot: number): void {
    if (this.locked || slot === this.blockedPosition) return;
    const moves = this.getMoves();
    if (ev.shiftKey) {
      const token = moves[slot] > 7 ? Math.round(moves[slot] / 4) - 1 : 0;
      let wantToken = (ev.button + 1 + token) % 4;
      while (wantToken !== 0 && this.lastTick.attr[wantToken] - this.usingManeuvers[wantToken] < 100) {
        wantToken = (ev.button + 1 + wantToken) % 4;
      }
      if (wantToken > 0) {
        const maneuver = wantToken * 4 + 4;
        moves[slot] = this.lastTick.attr[wantToken] - this.usingManeuvers[wantToken] === 200 ? maneuver + 1 : maneuver;
      } else {
        moves[slot] = 0;
      }
      void this.sendMoves();
      return;
    }
    const move = moves[slot];
    if ((move === 0 && this.maxMoves) || move > 11) return;
    if (move > 7) {
      moves[slot] = (move + 2) % 4 + 8;
    } else {
      let wantMove = (ev.button + 1 + move) % 4;
      while (wantMove !== 0 && this.haveMoves[wantMove - 1] - this.usingMoves[wantMove - 1] <= 0) {
        wantMove = (ev.button + 1 + wantMove) % 4;
      }
      moves[slot] = wantMove;
    }
    void this.sendMoves();
  }

  checkMaxMoves(): void {
    if (this.locked) return;
    this.usingMoves = [0, 0, 0];
    this.usingManeuvers = [this.usingManeuvers[0], 0, 0, 0];
    let moveCount = 0;
    for (let i = 0; i < this.moves.length; i++) {
      const move = this.moves[i];
      if (move === 0) continue;
      moveCount++;
      if (moveCount > this.myBoat.maxMoves) {
        this.moves[i] = 0;
        this.blockedPosition = i;
        continue;
      }
      if (move > 7) {
        const maneuver = Math.floor(move / 4 - 1);
        const points = move % 2 === 0 ? 100 : 200;
        if (this.lastTick.attr[maneuver] >= points + this.usingManeuvers[maneuver]) {
          this.usingManeuvers[maneuver] = points;
        } else this.moves[i] = 0;
      } else if (this.haveMoves[move - 1] > this.usingMoves[move - 1]) this.usingMoves[move - 1]++;
      else this.moves[i] = 0;
    }
  }

  addShot(e: MouseEvent, i: number): void {
    if (this.locked) return;
    if (e.shiftKey) {
      const points = this.lastTick.attr[0] - this.usingManeuvers[0];
      if (points >= 100) {
        this.dragCannon(this.lastTick.attr[0] - this.usingManeuvers[0] === 200 ? 5 : 4);
        this.dropCannon(i);
        return;
      }
    }
    const oldShots = this.shots[i];
    if (oldShots > 5) {
      this.shots[i] = 0;
    } else if (oldShots > 2) {
      this.shots[i] = this.myBoat.maxShots > 1 ? oldShots + 2 : 0;
    } else {
      this.shots[i] = (oldShots + 1) % (this.myBoat.maxShots + 1);
    }
    void this.sendShots();
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
