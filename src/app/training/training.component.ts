import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EscMenuService } from '../esc-menu/esc-menu.service';
import { TeamColorsCss } from '../lobby/cadegoose/cade-entry-status/cade-entry-status.component';
import { Boat } from '../lobby/quacken/boats/boat';
import { ParseTurns } from '../replay/cadegoose/parse-turns';
import { SettingsService } from '../settings/settings.service';
import { InCmd, Internal, OutCmd } from '../ws/ws-messages';
import { WsService } from '../ws/ws.service';
import { MoveNode, MoveTiers } from '../replay/cadegoose/types';
import { ParsedTurn } from '../lobby/cadegoose/types';
import { SettingGroup } from '../settings/setting/settings';
import { LobbyWrapperService } from '../replay/lobby-wrapper/lobby-wrapper.service';
import { OutMessage } from '../ws/ws-send-types';
import { OutRequest } from '../ws/ws-request-types';
import { AiRender } from '../replay/cadegoose/ai-render';

function mapMoves(m: number | string): string {
  // eslint-disable-next-line no-sparse-arrays
  return ['_', 'L', 'F', 'R', , , , , '<', , '>'][+m] || 'S';
}

const shotNames = [
  'Move 1 Left',
  'Move 1 Right',
  'Move 2 Left',
  'Move 2 Right',
  'Move 3 Left',
  'Move 3 Right',
  'Move 4 Left',
  'Move 4 Right',
];

@Component({
  selector: 'q-training',
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss',
  standalone: false,
})
export class TrainingComponent implements OnInit, OnDestroy {
  private ws = inject(WsService);
  private ss = inject(SettingsService);
  private route = inject(ActivatedRoute);
  esc = inject(EscMenuService);
  private wrapper = inject(LobbyWrapperService);

  @ViewChild('turnTab', { static: true, read: ElementRef }) turnTab?: ElementRef<HTMLElement>;
  mapMoves = mapMoves;

  private sub = new Subscription();
  private map = '';
  tabIndex = 0;
  turns: ParsedTurn[] = [];
  private moves: Record<string, MoveNode> = {};
  private overlay = new AiRender(this.ws, 20, 36);
  private rawMoves: {
    moves?: Map<string, MoveNode>;
    boat?: Boat;
    turn?: ParsedTurn;
  } = {};

  bestMoves = {
    safest: [] as string[],
    plusShots: [] as string[],
    points: [] as string[],
    score: [] as string[],
  };

  missedShots: string[] = [];

  activeTurn?: ParsedTurn;
  activeMove?: MoveNode;
  maxScore = 0;
  teamColors = TeamColorsCss;
  myBoat = new Boat('');

  ngOnInit(): void {
    if (this.wrapper.ws) {
      this.overlay = new AiRender(this.wrapper.ws, 20, 36);
      this.wrapper.ws.user = this.ws.user;
      // pretend to be connected so the hud lets us input moves
      this.wrapper.ws.connected = true;
    }

    void this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: 'Welcome to 1v1 training. Choose a turn and click a boat to begin.', from: '' } });
    this.route.paramMap.subscribe(map => this.getMatch(Number(map.get('id'))));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (v) this.ws.send(OutCmd.BnavJoin);
    }));
    this.sub.add(this.wrapper.boats?.clickedBoat$.subscribe(this.clickBoat.bind(this)));
    this.sub.add(this.wrapper.ws?.outMessages$.subscribe(this.handleFakeWs.bind(this)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private clickBoat(b: Boat) {
    if (this.wrapper.ws) this.wrapper.ws.sId = 0;
    this.myBoat.isMe = false;
    if (b === this.myBoat) {
      this.myBoat = new Boat('');
    } else {
      b.isMe = true;
      this.myBoat = b;
      if (this.wrapper.ws) this.wrapper.ws.sId = b.id;
    }
    this.wrapper.boats?.setMyBoat(this.myBoat);
    this.updateBoat();
  }

  private updateBoat() {
    const tick = this.activeTurn?.ticks[this.myBoat.id];
    if (tick) {
      tick.tp = 16;
      tick.t[0][0] = 4;
      tick.t[1][0] = 4;
      tick.t[2][0] = 4;
      tick.attr = { 1: 100 };
      void this.wrapper.ws?.dispatchMessage({ cmd: InCmd.BoatTick, data: tick });
    }

    const myMoves = this.activeTurn?.sync.moves?.find(m => m.t === this.myBoat.id);
    setTimeout(() => {
      this.myBoat.moveLock = 0;
      if (this.myBoat.isMe && myMoves) {
        void this.wrapper.ws?.dispatchMessage({
          cmd: Internal.MyMoves,
          data: {
            moves: myMoves.m,
            shots: myMoves.s || [],
          },
        });
      }
    });
    delete this.activeMove;
  }

  private async getMatch(id: number) {
    const match = await this.ws.request(OutCmd.MatchData, +id);
    if (!match || !match.data) return;
    [this.turns, this.map, this.maxScore] = ParseTurns(match.data.messages);
    const join = match.data?.messages[0]?.[0];
    if (join) void this.wrapper.ws?.dispatchMessage({ ...join });
    setTimeout(() => {
      this.clickTurn(this.turns[0]);
      void this.esc.openMenu(false);
    }, 100);

    if (!match.data) return;
    const settings = match.data.settings;
    for (const [group, setting] of Object.entries(settings)) {
      if (setting.turnTime) setting.turnTime.value = 65;
      this.ss.setSettings(group as SettingGroup, setting);
    }
  }

  private handleFakeWs(m: OutMessage | OutRequest) {
    switch (m.cmd) {
      case OutCmd.Moves:
      case OutCmd.Shots:
        // eslint-disable-next-line no-case-declarations
        const myMoves = { moves: [...this.myBoat.moves], shots: [...this.myBoat.shots] };
        if (m.cmd === OutCmd.Moves) {
          myMoves.moves = m.data;
          this.myBoat.moves = m.data;
        } else {
          myMoves.shots = m.data;
          this.myBoat.shots = m.data;
        }
        void this.wrapper.ws?.dispatchMessage({ cmd: Internal.MyMoves, data: myMoves });
        delete this.activeMove;
        break;
      case OutCmd.Ready:
        if (m.data.ready) void this.imReady();
        break;
    }
  }

  private async imReady() {
    const turn = this.activeTurn;
    if (!turn || !this.myBoat.isMe) return;

    // if (this.myBoat !== this.rawMoves.boat || this.activeTurn !== this.rawMoves.turn) {
    const response = await this.ws.request(OutCmd.MatchTraining, {
      sync: turn.sync.sync,
      map: this.map,
      myBoat: this.myBoat.id,
      tick: (this.myBoat.moves.some(m => m > 3) && turn.ticks[this.myBoat.id]) || undefined,
    });
    if (!response) return;

    this.rawMoves = {
      moves: new Map(Object.entries(response.nodes)),
      boat: this.myBoat,
      turn: this.activeTurn,
    };
    this.parseMoves();
    // this.overlay.setBoat({
    //   pm: response.points,
    // } as AiBoatData);
    // this.overlay.setMetric('EndBonus');

    this.activeMove = this.moves[this.myBoat.moves.join(',')];
    this.updateShotsMissed();
    this.tabIndex = 1;
  }

  private updateShotsMissed() {
    this.missedShots = [];
    if (!this.activeMove) return;
    const myShots = this.myBoat.shots;
    this.activeMove.ShotsHitArray.forEach((s, i) => {
      if (s && myShots?.[i] !== this.myBoat.maxShots) this.missedShots.push(shotNames[i] || '');
    });
  }

  clickTurn(turn?: ParsedTurn): void {
    this.activeTurn = turn ?? this.activeTurn;
    const buttons = this.turnTab?.nativeElement.children;
    setTimeout(() => {
      buttons?.[(this.activeTurn?.turn || 1) - 1]?.scrollIntoView({ block: 'center' });
    });
    if (!turn) return;
    const rawTurn = this.activeTurn?.rawTurn;
    if (rawTurn) void this.wrapper.ws?.dispatchMessage({ cmd: InCmd.Turn, data: rawTurn });
    void this.wrapper.ws?.dispatchMessage({ cmd: InCmd.Sync, data: turn.sync });

    const moves = this.activeTurn?.sync.moves || [];
    setTimeout(() => {
      void this.wrapper.ws?.dispatchMessage({ cmd: InCmd.Moves, data: moves });
    });
    this.updateBoat();
  }

  private parseMoves() {
    let maxScore = -Infinity;
    this.rawMoves.moves?.forEach(n => {
      n.Score = n.Score / 100 + 5;
      n.ShotsHit /= 100;
      n.ShotsTaken /= 100;
      n.PointGain /= 100;
      n.RocksBumped /= 100;
      if (n.Score > maxScore) maxScore = n.Score;
    });
    if (maxScore < 10) {
      const oldMax = maxScore;
      this.rawMoves.moves?.forEach(n => {
        n.Score += 10 - oldMax;
        if (n.Score > maxScore) maxScore = n.Score;
      });
    }

    const moves: MoveNode[] = [];
    this.rawMoves.moves?.forEach((n, m) => {
      if (n.Score >= maxScore * 0.9) n.tier = MoveTiers.Incredible;
      else if (n.Score >= maxScore * 0.8) n.tier = MoveTiers.Excellent;
      else if (n.Score >= maxScore * 0.6) n.tier = MoveTiers.Good;
      else if (n.Score >= maxScore * 0.4) n.tier = MoveTiers.Fine;
      else n.tier = MoveTiers.Poor;

      if (n.WreckedBy) n.wreckedByString = n.WreckedBy.map(m => m.map(mapMoves).join(''));
      if (n.Wrecks) n.wrecksString = n.Wrecks.map(m => m.map(mapMoves).join(''));
      if (n.BlockedBy) n.blockedByString = n.BlockedBy.map(m => m.map(mapMoves).join(''));
      if (n.Blocks) n.blocksString = n.Blocks.map(m => m.map(mapMoves).join(''));
      n.movesString = m.split(',').map(mapMoves).join('');
      moves.push(n);
      this.moves[m] = n;
    });

    moves.sort((b, a) => a.Score - b.Score);
    this.bestMoves.score = moves.slice(0, 4).filter(m => m.Score >= maxScore * 0.8).map(m => m.movesString);
    moves.sort((b, a) => a.PointGain - b.PointGain);
    this.bestMoves.points = moves.slice(0, 4).map(m => m.movesString);
    moves.sort((a, b) => a.ShotsTaken - b.ShotsTaken);
    this.bestMoves.safest = moves.slice(0, 4).map(m => m.movesString);
    moves.sort((b, a) => a.ShotsHit - a.ShotsTaken - b.ShotsHit + b.ShotsTaken);
    this.bestMoves.plusShots = moves.slice(0, 4).map(m => m.movesString);
  }
}
