import { Component, OnInit } from '@angular/core';
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
  moveKeys: Record<number, KeyActions> = {
    0: KeyActions.CBlank,
    1: KeyActions.CLeft,
    2: KeyActions.CForward,
    3: KeyActions.CRight,
  } as const;

  actions = {
    bombLeft: KeyActions.CBombLeft,
    bombRight: KeyActions.CBombRight,
    BombLeftStrict: KeyActions.CBombLeftStrict,
    BombRightStrict: KeyActions.CBombRightStrict,
    prevSlot: KeyActions.CPrevSlot,
    nextSlot: KeyActions.CNextSlot,
    ready: KeyActions.CReady,
    back: KeyActions.CBack,
  };

  wantManeuver = 0;
  maneuvers = [
    { id: 4, class: 'move bombtoken', title: 'Chain Shot' },
    { id: 8, class: 'move', title: 'In-place Turn' },
    { id: 12, class: 'move', title: 'Double Forward' },
    { id: 16, class: 'move', title: 'Flotsam' },
  ];

  tokenStrings = ['', '', ''];
  lastTick = { tp: 0, attr: {} } as BoatTick;
  wantMove = 2;
  auto = true;
  protected group = 'l/cade';

  ngOnInit(): void {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(Internal.MyBoat, () => {
      this.wantMove = 2;
      this.wantManeuver = 0;
      this.auto = true;
      this.localBoat.shots = [0, 0, 0, 0, 0, 0, 0, 0];
    }));
    this.subs.add(this.ws.subscribe(Internal.MyMoves, (moves: MoveMessage) => {
      this.localBoat.moves = [...moves.moves];
      if (moves.shots) this.localBoat.shots = [...moves.shots];
    }));
    this.subs.add(this.ws.subscribe(InCmd.BoatTick, (t: BoatTick) => {
      if (!t.attr) t.attr = {};
      this.lastTick = t;
      this.totalTokens.shots = t.tp;
      this.totalTokens.maneuvers = Object.values(t.attr) as [number, number, number, number];
      const hadMoves = this.totalTokens.moves;
      if (t.t) {
        this.totalTokens.moves = [0, 0, 0];
        for (let i = 0; i < t.t.length; i++) {
          const tokens = t.t[i];
          if (!tokens) continue;
          this.tokenStrings[i] = tokens.reverse().join(', ');
          for (const count of tokens) this.totalTokens.moves[i] += count;
        }
      }
      this.totalTokens = { ...this.totalTokens };

      if (this.auto &&
        (this.totalTokens.moves[0] !== hadMoves[0] ||
          this.totalTokens.moves[1] !== hadMoves[1] ||
          this.totalTokens.moves[2] !== hadMoves[2])
      ) {
        this.setAutoWant();
      }
    }));
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
    if (this.myBoat.ready || (this.secondsPerTurn < 40 && this.turnSeconds > 0)) return;
    this.stopTimer();
    this.myBoat.ready = true;
    this.lockTurn = this.turn + 1;
    this.ws.send(OutCmd.Ready, { ready: true, ...this.localBoat });
  }

  private setAutoWant() {
    let min = 255;
    for (const move of [1, 0, 2]) {
      const haveMove = this.totalTokens.moves[move] || 0;
      if (haveMove < min) {
        min = haveMove;
        this.wantMove = move + 1;
      }
    }
    this.ws.send(OutCmd.WantMove, this.wantMove);
  }

  dragManeuver(token: number): void {
    if (token >= 8) return this.drag(token);
    this.dragCannon(8, token);
  }

  dragCannon(slot = 8, token = 1): void {
    if (!token) return;
    if (token > 5) token -= 2;
    if (token < 4) token = 6;
    this.dragContext.move = token;
    this.dragContext.source = slot;
  }

  protected async sendShots(): Promise<void> {
    if (this.arrayEqual(this.serverBoatPending.shots, this.localBoat.shots)) return;
    this.serverBoatPending.shots = [...this.localBoat.shots];
    this.serverBoat.shots = await this.ws.request(OutCmd.Shots, this.localBoat.shots);
  }

  async setTurn(turn: number, sec: number = this.secondsPerTurn - 1): Promise<void> {
    const old = this.secondsPerTurn;
    await this.ss.get('l/cade', 'turnTime');
    super.setTurn(turn, sec + this.secondsPerTurn - old);
  }

  disengage(side = 0): void {
    this.ws.send(OutCmd.SpawnSide, side);
    void this.ss.getGroup('boats').then(settings => {
      if (settings.spawnSide) settings.spawnSide.value = side;
    });
  }
}
