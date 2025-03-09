import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { KeyActions } from '../../../settings/key-binding/key-actions';
import { InCmd, Internal, OutCmd } from '../../../ws/ws-messages';
import { HudComponent } from '../../quacken/hud/hud.component';
import { BoatTick } from '../../quacken/boats/types';
import { SettingGroup } from '../../../settings/setting/settings';

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
  styleUrl: './hud.component.scss',
  standalone: false,
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
  group = 'l/cade' as SettingGroup;
  maxMoves = 3;

  ngOnInit(): void {
    super.ngOnInit();
    this.subs.add(this.boats.myBoat$.subscribe(() => {
      this.updateWantMove$.next(true);
      this.updateMaxMoves();
    }));
    this.subs.add(this.ws.subscribe(Internal.MyMoves, moves => {
      this.localBoat.moves = [...moves.moves];
      this.serverBoat.moves = [...moves.moves];
      if (moves.shots) {
        this.localBoat.shots = [...moves.shots];
        this.serverBoat.shots = [...moves.shots];
      }
      this.localBoat = { ...this.localBoat };
      this.serverBoatPending = { ...this.serverBoat };
    }));

    this.subs.add(this.ws.subscribe(InCmd.Turn, () => {
      this.updateMaxMoves();
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
          for (const count of tokens) this.totalTokens.moves[i]! += count;
        }
      }
      this.totalTokens = { ...this.totalTokens };
      this.updateWantMove$.next(false);
      // if our moves haven't reset yet, we haven't used any tokens yet this turn
      if (this.lastMoveReset < this.turn) {
        this.unusedTokens.moves = [...this.totalTokens.moves];
        this.unusedTokens.shots = this.totalTokens.shots;
      }
      this.updateMaxMoves();
    }));
  }

  private updateMaxMoves(): void {
    this.maxMoves = this.lastTick.attr[255] ?? this.turn < -1 ? this.myBoat.maxMoves - 1 : this.myBoat.maxMoves;
  }

  setWantMove(value: number): void {
    this.ws.send(OutCmd.WantMove, value);
  }

  setWantToken(value: number): void {
    this.ws.send(OutCmd.WantManeuver, value);
  }

  protected async sendShots(): Promise<void> {
    if (this.arrayEqual(this.serverBoatPending.shots, this.localBoat.shots)) return;
    this.serverBoatPending.shots = [...this.localBoat.shots];
    this.serverBoat.shots = await this.ws.request(OutCmd.Shots, this.localBoat.shots) || this.serverBoat.shots;
  }

  async setTurn(turn: number, sec: number = this.secondsPerTurn - 1): Promise<void> {
    const old = this.secondsPerTurn;
    await this.ss.get(this.group, 'turnTime');
    super.setTurn(turn, sec + this.secondsPerTurn - old);
  }

  disengage(side = 0): void {
    this.ws.send(OutCmd.SpawnSide, side);
    void this.ss.getGroup('boats').then(settings => {
      if (settings.spawnSide) settings.spawnSide.value = side;
    });
  }
}
