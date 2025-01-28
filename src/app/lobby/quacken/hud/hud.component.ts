import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { FriendsService } from '../../../chat/friends/friends.service';
import { InCmd, Internal, OutCmd } from '../../../ws/ws-messages';
import { KeyBindingService } from '../../../settings/key-binding/key-binding.service';
import { SettingsService } from '../../../settings/settings.service';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { Boat } from '../boats/boat';
import { WsService } from '../../../ws/ws.service';
import { Tokens } from '../../../boats/move-input/move-input.component';
import { KeyActions } from '../../../settings/key-binding/key-actions';
import { SettingGroup } from '../../../settings/setting/settings';
import { CadeLobby } from '../../cadegoose/types';
import { BoatsService } from '../boats/boats.service';
import { LobbyService } from '../../lobby.service';
import { LobbyStatus } from '../../cadegoose/lobby-type';

export const weapons = [
  '', '', 'powderkeg', '', '', '', '', '', '', '',
  '', '', '', 'spin',
];

@Component({
  selector: 'q-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss'],
})
export class HudComponent implements OnInit, OnDestroy {
  @Input() group = 'l/quacken' as SettingGroup;
  @Input() kbControls = 1;
  @Input() shiftSpecials = 0;
  @Input() moveKeys: Record<number, KeyActions> = {
    0: KeyActions.QBlank,
    1: KeyActions.QLeft,
    2: KeyActions.QForward,
    3: KeyActions.QRight,
    4: KeyActions.QToken,
  } as const;

  @Input() actions = {
    bombLeft: KeyActions.QBombLeft,
    bombRight: KeyActions.QBombRight,
    BombLeftStrict: KeyActions.QBombLeftStrict,
    BombRightStrict: KeyActions.QBombRightStrict,
    tokenLeft: KeyActions.Noop,
    tokenRight: KeyActions.Noop,
    prevSlot: KeyActions.QPrevSlot,
    nextSlot: KeyActions.QNextSlot,
    ready: KeyActions.QReady,
    back: KeyActions.QBack,
  };

  tokens = [
    '', '', '', '', '', '', '', '', '', '',
    'duckpoo', 'duckpoo', 'duckpoo', 'duckpoo',
  ];

  localBoat = {
    moves: [0, 0, 0, 0],
    shots: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  serverBoat = {
    moves: [0, 0, 0, 0],
    shots: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  protected serverBoatPending = {
    moves: [0, 0, 0, 0],
    shots: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  totalTokens: Tokens = {
    moves: [5, 5, 5],
    shots: 16,
    maneuvers: [0, 0, 0, 0],
  };

  unusedTokens: Tokens = {
    moves: [2, 4, 2],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  weapons = weapons;
  myBoat = new Boat('');

  turn = 0;
  protected turnsLeft = 0;
  lastMoveReset = -1;
  dragContext = { source: 8, move: 0, type: 'move' };
  protected subs = new Subscription();
  protected lobbySettings = this.ss.prefetch('l/cade');
  protected get maxTurn(): number { return this.lobbySettings.turns?.value || 90; }
  get secondsPerTurn(): number { return this.lobbySettings.turnTime?.value || 30; }

  private timeInterval?: number;
  static readonly maxSeconds = 65;
  get isUnlimitedTime(): boolean { return this.secondsPerTurn === HudComponent.maxSeconds; }

  private turnStartTime = 0;
  protected turnSecondsRemaining = 0;
  public blockedPosition = 3;
  seconds$ = new BehaviorSubject<number>(76);

  constructor(
    public ws: WsService,
    public fs: FriendsService,
    protected kbs: KeyBindingService,
    protected ss: SettingsService,
    public es: EscMenuService,
    protected boats: BoatsService,
    protected lobbyService: LobbyService<CadeLobby>,
  ) { }

  ngOnInit(): void {
    void this.ss.getGroup(this.group).then(settings => this.lobbySettings = settings);
    this.bindKeys();
    this.subs.add(this.boats.myBoat$.subscribe(b => {
      if (b === this.myBoat) return;
      this.myBoat = b;
    }));
    this.subs.add(this.ws.subscribe(Internal.ResetMoves, this.resetMoves.bind(this)));
    this.subs.add(this.ws.subscribe(InCmd.BoatTick, t => {
      this.myBoat.damage = t.d;
      this.totalTokens.shots = t.tp >= 2 ? 1 : 0;
    }));

    // eslint-disable-next-line rxjs/no-async-subscribe
    this.subs.add(this.lobbyService.get().subscribe(async m => {
      if (m.inProgress) this.turn = 1;
      this.myBoat.ready = false;
      this.resetMoves();
      this.lastMoveReset = -1;

      // make sure the settings are loaded so we don't start the timer with the wrong settings
      await this.ss.getGroup(this.group);
      if (m.seconds) {
        if (m.seconds > 20) m.seconds = 20;
        m.seconds = Math.round(m.seconds * this.secondsPerTurn / 30);
      }
      if (!this.timeInterval && m.inProgress === LobbyStatus.MidMatch) this.startTimer();
      else this.stopTimer();
      // m.turn for backwards compatibility with replays
      const turnsLeft = m.turnsLeft === undefined
        ? this.maxTurn - (m as any).turn || 0
        : m.turnsLeft - 1;
      this.setTurn(turnsLeft, this.secondsPerTurn - (m.seconds || -1) - 2);
    }));

    this.subs.add(this.ws.subscribe(InCmd.LobbyStatus, m => {
      if (m === LobbyStatus.MidMatch) {
        this.updateTurnStart(this.turnSecondsRemaining);
        this.startTimer();
      } else {
        this.stopTimer();
      }
    }));

    this.subs.add(this.ws.subscribe(InCmd.Turn, turn => {
      this.turn = turn.turn + 1;
      this.startTimer();
      // turn.turn for backwards compatibility with replays
      const turnsLeft = turn.turnsLeft === undefined
        ? this.maxTurn - turn.turn || 0
        : turn.turnsLeft - 1;
      this.setTurn(turnsLeft);

      if (!this.myBoat.moveLock) this.myBoat.moveLock = 99;
      if (this.myBoat.bomb) this.myBoat.tokenPoints = 0;
    }));

    this.subs.add(this.ws.subscribe(InCmd.Sync, s => {
      this.myBoat.ready = false;
      this.turn = s.turn ?? this.turn;
      const myBoat = s.sync.find(boat => boat.id === this.myBoat.id);
      if (myBoat) this.myBoat.moveLock = myBoat.ml;
      this.resetMoves();
      if (this.myBoat.moveLock > this.maxTurn) return;
      if (this.turn === 0 || !this.myBoat.isMe) return;
      if (this.myBoat.moveLock > this.turn) {
        void this.ws.dispatchMessage({
          cmd: InCmd.ChatMessage,
          data: { type: 1, message: 'Unlocking moves in ' + (this.myBoat.moveLock - this.turn + 1) + ' turns.', from: '' },
        });
      } else if (this.myBoat.moveLock === this.turn) {
        void this.ws.dispatchMessage({
          cmd: InCmd.ChatMessage,
          data: { type: 1, message: 'Unlocking moves next turn.', from: '' },
        });
      }
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.stopTimer();
  }

  protected zeroFill(input: number[]): number[] {
    for (const i in input) input[i] = 0;
    return input;
  }

  protected resetMoves(force = false): void {
    if (!force) {
      if (!this.ws.connected || !this.myBoat.isMe) return;
      if (this.turn <= this.lastMoveReset) return;
    }
    if (this.myBoat.moveLock <= this.turn) this.myBoat.moveLock = 0;
    else this.myBoat.moveLock %= 100;
    this.myBoat.ready = false;
    this.lastMoveReset = this.turn;
    this.totalTokens = { ...this.totalTokens };
    this.zeroFill(this.localBoat.moves);
    this.zeroFill(this.localBoat.shots);
    this.localBoat = { ...this.localBoat };
    this.zeroFill(this.serverBoat.moves);
    this.zeroFill(this.serverBoat.shots);
    this.zeroFill(this.serverBoatPending.moves);
    this.zeroFill(this.serverBoatPending.shots);
  }

  protected bindKeys() {
    if (this.actions.ready) {
      this.subs.add(this.kbs.subscribe(this.actions.ready, v => {
        if (!v || !this.kbControls || this.lobbySettings.turnTime.value !== 65) return;
        this.toggleReady();
      }));
    }
  }

  toggleReady(): void {
    if (!this.myBoat.ready) return this.imReady();
    this.myBoat.ready = false;
    this.myBoat.moveLock %= 100;
    this.ws.send(OutCmd.Ready, { ready: false, ...this.localBoat });
  }

  imReady(): void {
    if (this.myBoat.ready) return;
    this.stopTimer();
    this.myBoat.ready = true;
    this.myBoat.moveLock += 100;
    this.ws.send(OutCmd.Ready, { ready: true, ...this.localBoat });
  }

  start(): void {
    this.ws.send(OutCmd.ChatCommand, '/start');
  }

  protected arrayEqual(a: number[], b: number[]): boolean {
    for (const i in a) if (a[i] !== b[i]) return false;
    return true;
  }

  async sendMoves(): Promise<void> {
    if (this.myBoat.ready) return;
    void this.sendShots();
    if (this.arrayEqual(this.serverBoatPending.moves, this.localBoat.moves)) return;
    this.serverBoatPending.moves = [...this.localBoat.moves];
    this.serverBoat.moves = await this.ws.request(OutCmd.Moves, this.localBoat.moves) || this.serverBoat.moves;
  }

  protected async sendShots(): Promise<void> {
    if (this.arrayEqual(this.serverBoatPending.shots, this.localBoat.shots)) return;
    this.serverBoatPending.shots = [...this.localBoat.shots];
    for (let i = 0; i < this.localBoat.shots.length; i++) {
      if (this.localBoat.shots[i]) {
        await this.ws.request(OutCmd.Bomb, [1, 5, 2, 6, 3, 7, 4, 8][i] || 0);
        this.serverBoat.shots = [0, 0, 0, 0, 0, 0, 0, 0];
        this.serverBoat.shots[i] = 1;
        return;
      }
    }
    await this.ws.request(OutCmd.Bomb, 0);
    this.serverBoat.shots = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  drag(move: number, slot = 8): void {
    this.dragContext.move = move;
    this.dragContext.source = slot;
  }

  setTurn(turn: number, sec: number = this.secondsPerTurn - 1): void {
    if (this.turn === 0) sec = 0;
    else if (turn < 0) {
      this.endRound();
      return;
    }
    this.turnsLeft = turn;

    this.updateTurnStart(sec);
    this.turnSecondsRemaining = sec;
    this.updatetime();
  }

  private updateTurnStart(offset: number): void {
    // Offset the start time by 100ms to avoid edge jittering
    this.turnStartTime = new Date().valueOf() - (this.secondsPerTurn - offset) * 1000 + 100;
  }

  private endRound(): void {
    this.turnSecondsRemaining = 0;
    this.stopTimer();
    this.updatetime();
    this.lastMoveReset = -1;
    this.turn = 0;
  }

  startTimer(ms = 500): void {
    clearInterval(this.timeInterval);
    this.timeInterval = window.setInterval(() => this.tickTimer(), ms);
  }

  stopTimer(): void {
    clearInterval(this.timeInterval);
    delete this.timeInterval;
  }

  private tickTimer() {
    if (this.turn === 0) return this.endRound();
    if (this.isUnlimitedTime) return;
    if (this.turnSecondsRemaining < 0.5) {
      this.myBoat.ready = false;
      this.imReady();
      return;
    }

    this.turnSecondsRemaining = this.secondsPerTurn - (new Date().valueOf() - this.turnStartTime) / 1000;
    if (this.turnSecondsRemaining < 0) this.turnSecondsRemaining = 0;
    this.updatetime();
  }

  protected updatetime(): void {
    this.seconds$.next(Math.floor(this.turnSecondsRemaining * 76 / this.secondsPerTurn) - 4);
    const totalSeconds = Math.max(
      Math.floor(this.turnsLeft * this.secondsPerTurn + this.turnSecondsRemaining),
      0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    void this.ws.dispatchMessage({ cmd: Internal.Time, data: minutes + ':' + seconds });
  }
}
