import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { KeyActions } from '../../../settings/key-binding/key-actions';
import { InCmd, Internal, OutCmd } from '../../../ws-messages';
import { HudComponent, BoatTick } from '../../quacken/hud/hud.component';

export const CadeKeyActions = {
  bombLeft: KeyActions.CBombLeft,
  bombRight: KeyActions.CBombRight,
  BombLeftStrict: KeyActions.CBombLeftStrict,
  BombRightStrict: KeyActions.CBombRightStrict,
  tokenLeft: KeyActions.CLeftChainshot,
  tokenRight: KeyActions.CRightChainshot,
  prevSlot: KeyActions.CPrevSlot,
  nextSlot: KeyActions.CNextSlot,
  ready: KeyActions.CReady,
  back: KeyActions.CBack,
};

export const CadeMoveKeys: Record<number, KeyActions> = {
  0: KeyActions.CBlank,
  1: KeyActions.CLeft,
  2: KeyActions.CForward,
  3: KeyActions.CRight,
  8: KeyActions.CTurnInPlace,
  12: KeyActions.CDoubleForward,
  16: KeyActions.CFlotsam,
} as const;

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
  moveKeys = CadeMoveKeys;
  actions = CadeKeyActions;

  maneuvers = [
    { id: 4, class: 'move bombtoken', title: 'Chain Shot' },
    { id: 8, class: 'move', title: 'In-place Turn' },
    { id: 12, class: 'move', title: 'Double Forward' },
    { id: 16, class: 'move', title: 'Flotsam' },
  ];

  tokenStrings = ['', '', ''];
  lastTick = { tp: 0, attr: {} } as BoatTick;
  updateWantMove$ = new Subject<boolean>();
  protected group = 'l/cade';

  ngOnInit(): void {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(Internal.MyBoat, () => {
      this.updateWantMove$.next(true);
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
      for (let i = 0; i < this.maneuvers.length; i++) this.totalTokens.maneuvers[i] = t.attr[i] || 0;
      if (t.t) {
        this.totalTokens.moves = [0, 0, 0];
        for (let i = 0; i < t.t.length; i++) {
          const tokens = t.t[i];
          if (!tokens) continue;
          this.tokenStrings[i] = tokens.reverse().join(', ');
          for (const count of tokens) this.totalTokens.moves[i] += count;
        }
      }
      if (this.lastMoveReset >= this.turn) {
        this.totalTokens = { ...this.totalTokens };
      } else {
        this.unusedTokens.moves = [...this.totalTokens.moves];
        this.unusedTokens.shots = this.totalTokens.shots;
      }
    }));
  }

  setWantMove(value: number): void {
    this.ws.send(OutCmd.WantMove, value);
  }

  setWantToken(value: number): void {
    this.ws.send(OutCmd.WantManeuver, value);
  }

  imReady(): void {
    if (this.myBoat.ready || (this.secondsPerTurn < 40 && this.turnSeconds > 0)) return;
    this.stopTimer();
    this.myBoat.ready = true;
    this.lockTurn = this.turn + 1;
    this.ws.send(OutCmd.Ready, { ready: true, ...this.localBoat });
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
