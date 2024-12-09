import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EscMenuService } from '../esc-menu/esc-menu.service';
import { TeamColorsCss } from '../lobby/cadegoose/cade-entry-status/cade-entry-status.component';
import { GuBoat, Point } from '../lobby/cadegoose/twod-render/gu-boats/gu-boat';
import { Boat } from '../lobby/quacken/boats/boat';
import { ParseTurns } from '../replay/cadegoose/parse-turns';
import { SettingsService } from '../settings/settings.service';
import { InCmd, Internal, OutCmd } from '../ws/ws-messages';
import { WsService } from '../ws/ws.service';
import { LobbyWrapperComponent } from './lobby-wrapper/lobby-wrapper.component';
import { MoveNode, MoveTiers } from '../replay/cadegoose/types';
import { ParsedTurn } from '../lobby/cadegoose/types';
import { MoveMessageIncoming } from '../lobby/quacken/boats/types';
import { SettingGroup } from '../settings/setting/settings';
import { InMessage } from '../ws/ws-subscribe-types';

function mapMoves(m: number | string): string {
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
  styleUrls: ['./training.component.scss'],
})
export class TrainingComponent implements OnInit, OnDestroy {
  @ViewChild(LobbyWrapperComponent, { static: true }) private lobbyWrapper?: LobbyWrapperComponent;
  @ViewChild('turnTab', { static: true, read: ElementRef }) turnTab?: ElementRef<HTMLElement>;
  mapMoves = mapMoves;

  private sub = new Subscription();
  private map = '';
  tabIndex = 0;
  turns: ParsedTurn[] = [];
  private moves: Record<string, MoveNode> = {};
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

  constructor(
    private ws: WsService,
    private ss: SettingsService,
    private route: ActivatedRoute,
    public esc: EscMenuService,
  ) { }

  ngOnInit(): void {
    if (this.lobbyWrapper) {
      this.ws.fakeWs = this.lobbyWrapper.ws;
      this.ws.fakeWs.user = this.ws.user;
    }

    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: 'Welcome to 1v1 training. Choose a turn and click a boat to begin.', from: '' } });
    this.route.paramMap.subscribe(map => this.getMatch(Number(map.get('id'))));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (v) this.ws.send(OutCmd.BnavJoin);
    }));
    this.sub.add(this.ws.fakeWs?.subscribe(Internal.BoatClicked, this.clickBoat.bind(this)));
    this.sub.add(this.ws.fakeWs?.subscribe(Internal.Boats, () => null));
    this.sub.add(this.ws.fakeWs?.outMessages$.subscribe(this.handleFakeWs.bind(this)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private clickBoat(b: Boat) {
    if (this.ws.fakeWs) this.ws.fakeWs.sId = 0;
    this.myBoat.isMe = false;
    this.myBoat.render?.rebuildHeader?.();
    if (b === this.myBoat) {
      this.myBoat = new Boat('');
      this.myBoat.render = {} as any;
      (this.myBoat.render as GuBoat).coords = { ...(b.render as GuBoat)?.coords } as Point;
    } else {
      b.isMe = true;
      b.render?.rebuildHeader();
      this.myBoat = b;
      if (this.ws.fakeWs) this.ws.fakeWs.sId = b.id;
    }
    this.ws.fakeWs?.dispatchMessage({ cmd: Internal.MyBoat, data: this.myBoat });
    this.updateBoat();
  }

  private updateBoat() {
    const tick = this.activeTurn?.ticks[this.myBoat.id];
    if (tick) {
      tick.tp = 16;
      tick.t[0][0] = 4;
      tick.t[1][0] = 4;
      tick.t[2][0] = 4;
      tick.attr = { 1: 100 }
      this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.BoatTick, data: tick });
    }
    const myMoves = this.activeTurn?.moves[this.myBoat.id];
    setTimeout(() => {
      this.myBoat.moveLock = -1;
      if (this.myBoat.isMe) {
        if (myMoves) this.ws.fakeWs?.dispatchMessage({ cmd: Internal.MyMoves, data: myMoves });
      }
    });
    delete this.activeMove;
  }

  private async getMatch(id: number) {
    const match = await this.ws.request(OutCmd.MatchData, +id);
    if (!match || !match.data) return;
    [this.turns, this.map, this.maxScore] = ParseTurns(match.data.messages);
    const join = match.data?.messages[0]?.[0];
    if (join) this.ws.fakeWs?.dispatchMessage({ ...join });
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

  private handleFakeWs(m: { cmd: OutCmd, data: any, id?: number }) {
    switch (m.cmd) {
      case OutCmd.Moves:
      case OutCmd.Shots:
        const myMoves = { moves: [...this.myBoat.moves], shots: [...this.myBoat.shots] };
        if (m.cmd === OutCmd.Moves) {
          myMoves.moves = m.data;
          this.myBoat.moves = m.data;
        } else {
          myMoves.shots = m.data;
          this.myBoat.shots = m.data;
        }
        this.ws.fakeWs?.dispatchMessage({ cmd: Internal.MyMoves, data: myMoves });
        delete this.activeMove;
        break;
      case OutCmd.Ready:
        if (this.activeTurn?.sync) this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.Sync, data: this.activeTurn?.sync });
        void this.imReady(m.data);
        break;
    }
  }

  private async imReady(moveMessage: { moves: number[], shots: number[] }) {
    const turn = this.activeTurn;
    if (!turn || !this.myBoat.isMe) return;

    // if (this.myBoat !== this.rawMoves.boat || this.activeTurn !== this.rawMoves.turn) {
    const response = await this.ws.request(OutCmd.MatchTraining, {
      sync: turn.sync.sync,
      map: this.map,
      myBoat: this.myBoat.id,
      tick: this.myBoat.moves.some(m => m > 3) && turn.ticks[this.myBoat.id] || undefined,
    });
    if (!response) return;

    this.rawMoves = {
      moves: new Map(Object.entries(response.nodes)),
      boat: this.myBoat,
      turn: this.activeTurn,
    };
    this.parseMoves();

    this.activeMove = this.moves[this.myBoat.moves.join(',')];
    this.updateShotsMissed();
    this.tabIndex = 1;
  }

  private updateShotsMissed() {
    this.missedShots = [];
    if (!this.activeMove) return;
    const myShots = this.activeTurn?.moves[this.myBoat.id]?.shots;
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
    if (rawTurn) this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.Turn, data: rawTurn });
    this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.Sync, data: turn.sync });
    const moves: MoveMessageIncoming[] = [];
    for (const [id, m] of Object.entries(this.activeTurn?.moves || {})) {
      moves.push({ t: +id, m: [...m.moves], s: [...m.shots] });
    }

    setTimeout(() => {
      this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.Moves, data: moves });
    });
    this.updateBoat();
  }

  private parseMoves() {
    let maxScore = -100;
    this.rawMoves.moves?.forEach(n => {
      n.Score = n.Score / 100 + 5;
      n.ShotsHit /= 100;
      n.ShotsTaken /= 100;
      n.PointGain /= 100;
      n.RocksBumped /= 100;
      if (n.Score > maxScore) maxScore = n.Score;
    });

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
