import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Scene } from 'three';
import { EscMenuService } from '../esc-menu/esc-menu.service';
import { TeamColorsCss } from '../lobby/cadegoose/cade-entry-status/cade-entry-status.component';
import { GuBoat, Point } from '../lobby/cadegoose/twod-render/gu-boats/gu-boat';
import { Boat } from '../lobby/quacken/boats/boat';
import { AiRender } from '../replay/cadegoose/ai-render';
import { ParsedTurn, ParseTurns } from '../replay/cadegoose/parse-turns';
import { SettingMap, SettingsService } from '../settings/settings.service';
import { InCmd, Internal, OutCmd } from '../ws-messages';
import { InMessage, WsService } from '../ws.service';
import { LobbyWrapperComponent } from './lobby-wrapper/lobby-wrapper.component';

function mapMoves(m: number | string): string {
  return ['_', 'L', 'F', 'R'][+m] || 'S';
}

const enum MoveTiers {
  Poor = 'Poor',
  Fine = 'Fine',
  Good = 'Good',
  Excellent = 'Excellent',
  Incredible = 'Incredible',
}

class MoveNode {
  x = 0;
  y = 0;
  Face = 0;
  MoveCount = 0;
  Score = 0;
  DamageTaken = 0;
  ShotsHit = 0;
  ShotsTaken = 0;
  RocksBumped = 0;
  OppRocksBumped = 0;
  PointGain = 0;

  tier: MoveTiers = MoveTiers.Poor;
  wreckedBy: string[] = [];
  wrecks: string[] = [];
  blockedBy: string[] = [];
  blocks: string[] = [];

  constructor(public Moves: number[]) { }
}

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
    moves?: Map<string, MoveNode[]>;
    boat?: Boat;
    turn?: ParsedTurn;
  } = {};

  bestMoves = {
    safest: [] as string[],
    plusShots: [] as string[],
    points: [] as string[],
    score: [] as string[],
  };

  activeTurn?: ParsedTurn;
  activeMove?: MoveNode;
  maxScore = 0;
  teamColors = TeamColorsCss;
  myBoat = new Boat('');
  private aiRender = new AiRender();

  constructor(
    private ws: WsService,
    private ss: SettingsService,
    private route: ActivatedRoute,
    public esc: EscMenuService,
  ) { }

  ngOnInit(): void {
    this.aiRender.setMetric('EndBonus');
    if (this.lobbyWrapper) {
      this.ws.fakeWs = this.lobbyWrapper.ws;
      this.ws.fakeWs.user = this.ws.user;
    }

    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: 'Welcome to 1v1 training.' } });
    this.route.paramMap.subscribe(map => this.getMatch(Number(map.get('id' || 0))));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (v) this.ws.send(OutCmd.BnavJoin);
    }));
    this.sub.add(this.ws.fakeWs?.subscribe(Internal.BoatClicked, this.clickBoat.bind(this)));
    this.sub.add(this.ws.fakeWs?.subscribe(Internal.Boats, () => null));
    this.sub.add(this.ws.fakeWs?.outMessages$.subscribe(this.handleFakeWs.bind(this)));
    this.sub.add(this.ws.fakeWs?.subscribe(Internal.Scene, (scene: Scene) => {
      scene.add(this.aiRender.object);
    }));
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
      this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.BoatTick, data: tick });
    }
    this.ws.fakeWs?.dispatchMessage({ cmd: Internal.ResetMoves, data: true });
    setTimeout(() => this.myBoat.moveLock = -1);
    delete this.activeMove;
  }

  private async getMatch(id: number) {
    const match = await this.ws.request(OutCmd.MatchData, +id);
    if (!match) return;
    [this.turns, this.map, this.maxScore] = ParseTurns(match.data?.messages);
    const join = match.data?.messages[0]?.[0];
    this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.LobbyJoin, data: join?.data });
    setTimeout(() => {
      this.clickTurn(this.turns[0]);
      this.esc.open = false;
    }, 100);

    if (!match.data) return;
    const settings = match.data.settings;
    for (const group in settings) {
      if (!settings.hasOwnProperty(group)) continue;
      const settingGroup: SettingMap = settings[group];
      if (settingGroup.turnTime) settingGroup.turnTime.value = 40;
      this.ss.setFakeSettings(group, settingGroup);
    }
  }

  private handleFakeWs(m: { cmd: OutCmd, data: any, id?: number }) {
    switch (m.cmd) {
      case OutCmd.Moves:
      case OutCmd.Shots:
        if (m.cmd === OutCmd.Moves) this.myBoat.moves = m.data;
        this.ws.fakeWs?.dispatchMessage(m as unknown as InMessage);
        delete this.activeMove;
        break;
      case OutCmd.Ready:
        this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.Sync, data: this.activeTurn?.sync });
        void this.imReady(m.data);
        break;
    }
  }

  private async imReady(moveMessage: { moves: number[], shots: number[] }) {
    const turn = this.activeTurn;
    if (!turn || !this.myBoat.isMe) return;
    turn.moves[this.myBoat.id] = moveMessage;

    if (this.myBoat !== this.rawMoves.boat || this.activeTurn !== this.rawMoves.turn) {
      const response = await this.ws.request(OutCmd.MatchTraining, {
        sync: turn.sync.sync,
        moves: turn.moves,
        map: this.map,
        myBoat: this.myBoat.id,
      });

      this.aiRender.setBoat({
        pm: response.points,
      } as any);
      this.rawMoves = {
        moves: new Map(Object.entries(response.nodes)),
        boat: this.myBoat,
        turn: this.activeTurn,
      };
      this.parseMoves();
    }

    this.activeMove = this.moves[this.myBoat.moves.map(mapMoves).join('')];
    this.myBoat.moves = this.activeMove?.Moves || this.myBoat.moves;
    this.tabIndex = 1;
  }

  clickTurn(turn?: ParsedTurn): void {
    this.activeTurn = turn ?? this.activeTurn;
    const buttons = this.turnTab?.nativeElement.children;
    setTimeout(() => {
      buttons?.[(this.activeTurn?.turn || 1) - 1]?.scrollIntoView({ block: 'center' });
    });
    if (!turn) return;
    this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.Turn, data: this.activeTurn?.rawTurn });
    this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.Sync, data: turn.sync });
    const moves = [];
    for (const [id, m] of Object.entries(this.activeTurn?.moves || {})) {
      moves.push({ t: id, m: m.moves, s: m.shots });
    }

    this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.Moves, data: moves });
    this.updateBoat();
  }

  private parseMoves() {
    let myMoveScores: { index: number, score: number }[] = [];
    const zeroMove = this.rawMoves.moves?.get('0000');
    if (!zeroMove) return;
    for (let i = 0; i < zeroMove.length; i++) {
      let score = 0;
      this.rawMoves.moves?.forEach(nodes => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const n = nodes[i]!;
        score += (n.ShotsHit - n.ShotsTaken) + (n.PointGain) - n.RocksBumped;
      });
      myMoveScores.push({ index: i, score });
    }
    myMoveScores.sort((a, b) => b.score - a.score);
    myMoveScores = myMoveScores.slice(0, myMoveScores.length / 4);
    const myMoves = new Set<number>();
    myMoveScores.forEach(m => myMoves.add(m.index));

    let moveScores: { score: number, move: string, mappedMove: string }[] = [];
    this.rawMoves.moves?.forEach((nodes, move) => {
      let score = 0;
      nodes.forEach((n, i) => {
        if (!myMoves.has(i)) return;
        score += (n.ShotsHit - n.ShotsTaken) + (n.PointGain) + n.OppRocksBumped * 2;
      });
      moveScores.push({ move, mappedMove: move.split('').map(mapMoves).join(''), score });
    });
    moveScores.sort((a, b) => a.score - b.score);
    moveScores = moveScores.filter((s, i) => {
      return i < 30 && (s.score < 10 || i < 10);
    });
    console.log(moveScores);

    this.moves = {};
    moveScores.forEach((s, i) => {
      const nodes = this.rawMoves.moves?.get(s.move);
      if (!nodes) return;
      const multiplier = (moveScores.length * 2 - i) / moveScores.length;
      for (const n of nodes) {
        const move = n.Moves.map(mapMoves).join('');
        if (!this.moves[move]) this.moves[move] = new MoveNode(n.Moves);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const myNode = this.moves[move]!;
        myNode.ShotsHit += n.ShotsHit * multiplier;
        myNode.ShotsTaken += n.ShotsTaken * multiplier;
        myNode.RocksBumped += n.RocksBumped;
        myNode.PointGain += n.PointGain * multiplier;
        const shotIncline = n.ShotsHit - n.ShotsTaken;
        if (shotIncline >= this.myBoat.maxShots * 2) myNode.wrecks.push(s.mappedMove);
        if (shotIncline <= -this.myBoat.maxShots * 2) myNode.wreckedBy.push(s.mappedMove);
        if (n.PointGain >= 3) myNode.blocks.push(s.mappedMove);
        if (n.PointGain <= -3) myNode.blockedBy.push(s.mappedMove);
      }
    });

    const moves = Object.values(this.moves);
    let maxScore = -100;
    for (const n of moves) {
      n.ShotsHit /= moveScores.length;
      n.ShotsTaken /= moveScores.length;
      n.RocksBumped /= moveScores.length;
      n.PointGain /= moveScores.length;
      n.Score = (n.ShotsHit - n.ShotsTaken) + (n.PointGain) - n.RocksBumped + 5;
      if (n.Score > maxScore) maxScore = n.Score;
    }

    for (const n of moves) {
      if (n.Score >= maxScore * 0.9) n.tier = MoveTiers.Incredible;
      else if (n.Score >= maxScore * 0.8) n.tier = MoveTiers.Excellent;
      else if (n.Score >= maxScore * 0.6) n.tier = MoveTiers.Good;
      else if (n.Score >= maxScore * 0.4) n.tier = MoveTiers.Fine;
    }

    moves.sort((b, a) => a.Score - b.Score);
    this.bestMoves.score = moves.slice(0, 4).map(m => m.Moves.map(mapMoves).join(''));
    moves.sort((b, a) => a.PointGain - b.PointGain);
    this.bestMoves.points = moves.slice(0, 4).map(m => m.Moves.map(mapMoves).join(''));
    moves.sort((a, b) => a.ShotsTaken - b.ShotsTaken);
    this.bestMoves.safest = moves.slice(0, 4).map(m => m.Moves.map(mapMoves).join(''));
    moves.sort((b, a) => a.ShotsHit - a.ShotsTaken - b.ShotsHit + b.ShotsTaken);
    this.bestMoves.plusShots = moves.slice(0, 4).map(m => m.Moves.map(mapMoves).join(''));
  }
}
