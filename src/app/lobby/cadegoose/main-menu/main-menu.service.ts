import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FriendsService } from '../../../chat/friends/friends.service';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { links } from '../../../settings/setting/setting.component';
import { Settings, BoatSetting, SettingGroup } from '../../../settings/setting/settings';
import { SettingsService } from '../../../settings/settings.service';
import { SoundService, Sounds } from '../../../sound.service';
import { Internal, InCmd, OutCmd } from '../../../ws/ws-messages';
import { WsService } from '../../../ws/ws.service';
import { Boat } from '../../quacken/boats/boat';
import { TeamColorsCss, TeamNames } from '../cade-entry-status/cade-entry-status.component';
import { TeamMessage, CadeLobby } from '../types';
import { LobbyWrapperService } from '../../../replay/lobby-wrapper/lobby-wrapper.service';
import { BoatsService } from '../../quacken/boats/boats.service';
import { LobbyService } from '../../lobby.service';
import { LobbyStatus } from '../lobby-type';
import { Stat } from '../stats/types';

export const DefaultStatColumns = [
  { stat: Stat.PointsScored, title: 'Points Scored' },
  { stat: Stat.PointsContested, title: 'Contested' },
  { stat: Stat.Kills, title: 'Enemies Sank' },
  { stat: Stat.Assists, title: 'Assists' },
  { stat: Stat.Deaths, title: 'Times Sank' },
  { stat: Stat.ShotsHit, title: 'Shots Hit' },
  { stat: Stat.ShotsFired, title: 'Fired' },
  { stat: Stat.ShotsTaken, title: 'Taken' },
];

export const DefaultExtraColumns = [
  { stat: Stat.ShotsFriendly, title: 'Friendly Fire' },
  { stat: Stat.ShotsFriendlyTaken, title: 'Taken' },
  { stat: Stat.ShotsMissed, title: 'Shots Missed' },
  { stat: Stat.RocksBumped, title: 'Rock Bumps' },
  { stat: Stat.WhirlSpins, title: 'Whirl Spins' },
  { stat: Stat.WindRides, title: 'Wind Rides' },

  // { stat: Stat.LeftUsed, title: 'Lefts' },
  // { stat: Stat.ForwardUsed, title: 'Forwards' },
  // { stat: Stat.RightUsed, title: 'Rights' },
  // { stat: Stat.DoubleForwardUsed, title: 'Double Forwards' },
  // { stat: Stat.TurnInSpotUsed, title: 'TiS' },
  // { stat: Stat.ChainshotUsed, title: 'Chainshots' },
  // { stat: Stat.FlotsamUsed, title: 'Flotsams' },
];

@Injectable()
export class MainMenuService implements OnDestroy {
  ws = inject(WsService);
  private fs = inject(FriendsService);
  es = inject(EscMenuService);
  ss = inject(SettingsService);
  private sound = inject(SoundService);
  private wrapper = inject(LobbyWrapperService);
  private boats = inject(BoatsService);
  private lobbyService = inject<LobbyService<CadeLobby>>(LobbyService);

  statColumns = DefaultStatColumns;
  extraStatColumns = DefaultExtraColumns;
  teamColors = TeamColorsCss;
  teamNames = TeamNames;
  boatTitles = (Settings.nextCadeBoat as BoatSetting).titles;
  voteOptions = [
    { icon: '', text: 'No vote' },
    { icon: 'pause', text: 'Voted pause' },
    { icon: 'play_arrow', text: 'Voted continue' },
    { icon: 'close', text: 'Voted forfeit' },
    { icon: 'handshake', text: 'Voted tie' },
  ];

  links = links;
  teamPlayers$ = new BehaviorSubject<TeamMessage[][]>([]);
  teamRanks: number[] = [];
  myBoat = new Boat('');
  private myBoatName = '';
  myTeam = 99;
  myJobbers = 100;
  myVote = 0;
  lastMapId = 0;
  ready = false;
  statsOpen = false;
  settings = this.ss.prefetch('l/cade');
  private subs = new Subscription();
  private firstJoin = true;
  group = 'l/cade' as SettingGroup;
  get lobby() { return this.lobbyService.get().value; }
  get status() { return this.lobbyService.status; }
  seeds: string[] = [];

  constructor() {
    if (this.wrapper.ws) this.ws = this.wrapper.ws;
    if (this.wrapper.fs) this.fs = this.wrapper.fs;
    if (this.wrapper.boats) this.boats = this.wrapper.boats;

    this.subs.add(this.lobbyService.get().subscribe(m => {
      if (!m) return;
      if (this.status.value === 0 && m.inProgress > 0) {
        void this.sound.play(Sounds.BattleStart, 0, Sounds.Notification);
      }
      this.statsOpen = false;

      if (m.seed && !this.seeds.includes(m.seed)) this.seeds.push(m.seed);
      if (m.players?.length) void this.ws.dispatchMessage({ cmd: InCmd.PlayerList, data: m.players });
      if (this.firstJoin) {
        this.firstJoin = false;
        void this.es.openTab(0, false, { lobbyTab: 0 });
      }
      const teamPlayers = this.teamPlayers$.getValue();
      while (teamPlayers.length < m.points.length) teamPlayers.push([]);
      this.teamPlayers$.next(teamPlayers);

      const myMoves = m.sync.myMoves;
      if (myMoves) {
        void this.ws.dispatchMessage({ cmd: Internal.MyMoves, data: { moves: myMoves.m, shots: myMoves.s || [] } });
        delete m.sync.myMoves;
      }
      const moves = m.sync.moves;
      if (moves) {
        void this.ws.dispatchMessage({ cmd: InCmd.Moves, data: moves });
        delete m.sync.moves;
      }
    }));
    this.subs.add(this.fs.lobby$.subscribe(r => {
      this.teamPlayers$.next(Array(this.teamPlayers$.getValue().length).fill([]));
      this.updatePlayers(Object.values(r));
    }));
    this.subs.add(this.ws.subscribe(InCmd.Team, m => {
      const players = this.fs.lobby$.getValue();
      if (!players.length) return;
      this.updatePlayers([m]);
      this.fs.lobby$.next([...players]);
    }));
    this.subs.add(this.ws.subscribe(InCmd.PlayerRemove, m => {
      this.removeUser(m);
    }));
    this.subs.add(this.ws.subscribe(InCmd.LobbyStatus, m => {
      if (!this.ws.connected) return;
      if (m === LobbyStatus.MidMatch) {
        void this.es.openMenu(false);
        this.myBoat.isMe = true;
        return;
      } else if (m === LobbyStatus.PreMatch) {
        this.myBoat.isMe = false;
        return;
      }
      void this.es.openTab(0, false, { lobbyTab: 0 });
    }));
    this.subs.add(this.boats.myBoat$.subscribe(b => {
      if (b.isMe && b.name !== this.myBoatName) this.gotBoat();
      this.myBoatName = b.name;
      this.myBoat = b;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Turn, t => {
      this.statsOpen = false;
      this.lastMapId = this.settings.map.value;
      if (!this.lobby) return;
      this.lobby.turnsLeft = t.turnsLeft;
      if (t.turnsLeft > 0) return;
      this.statsOpen = !!(t.stats && Object.keys(t.stats).length);
      this.myBoat.isMe = false;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Sync, () => {
      if (this.status.value === LobbyStatus.PreMatch && this.ws.connected) {
        void this.es.openTab(0, false, { lobbyTab: 0 });
        this.teamPlayers$.next(this.teamPlayers$.getValue());
        this.boats.setMyBoat(this.myBoat, false);
      }
    }));
    this.subs.add(this.settings.teams.stream.subscribe((v) => {
      if (v < 2) return;
      const teamPlayers = this.teamPlayers$.getValue();
      if (v < teamPlayers.length) {
        teamPlayers.length = v;
        this.teamPlayers$.next(teamPlayers);
        return;
      }
      while (teamPlayers.length < v) teamPlayers.push([]);
      this.updatePlayers(Object.values(this.fs.lobby$.getValue()));
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  vote(v: number): void {
    if (v === this.myVote) v = 0;
    this.myVote = v;
    this.ws.send(OutCmd.Vote, v);
  }

  private updateRanks() {
    const teamPlayers = this.teamPlayers$.getValue();
    this.teamRanks = Array(teamPlayers.length).fill(0);
    teamPlayers.forEach((team, i) => {
      let sum = 0;
      const variation = team.length > 1 ? 1 : 0;
      team.forEach((p) => { sum += p.sc?.[variation] || 0; });
      this.teamRanks[i] = Math.round(sum / (team.length || 1));
    });
  }

  private updatePlayers(players: TeamMessage[]) {
    const fsPlayers = this.fs.lobby$.getValue();
    if (!fsPlayers.length) return;
    for (const t of players) {
      const user = fsPlayers.find((mes) => mes.sId === t.sId);
      if (!user?.sId) continue;
      Object.assign(user, t);
      if (t.sId === this.ws.sId) {
        this.myTeam = t.t ?? 99;
        this.ready = t.r ?? false;
        this.ss.admin$.next(t.a ?? false);
        this.fs.allowInvite = t.a ?? false;
        this.myVote = t.v ?? 0;
      }
      this.setTeam(user.sId, t.t ?? 99, false);
    }
    this.updateRanks();
    this.teamPlayers$.next([...this.teamPlayers$.getValue()]);
  }

  submitRating(value: number): void {
    this.ws.send(OutCmd.RateMap, { id: this.lastMapId, rating: value });
  }

  private gotBoat() {
    if ([LobbyStatus.Voting, LobbyStatus.Paused].includes(this.status.value)) return;
    void this.es.openMenu(false);
    this.ready = false;
    for (const p of Object.values(this.fs.lobby$.getValue())) p.r = false;
  }

  toggleReady(): void {
    if (this.myBoat.isMe) {
      void this.es.openMenu(false);
      return;
    }
    if (this.myTeam === 99) {
      void this.es.openMenu(false);
      return;
    }
    this.ready = !this.ready;
    this.ws.send(OutCmd.Ready, { ready: this.ready });
  }

  joinTeam(team: number): void {
    if (team === this.myTeam) team = 99;
    this.ws.send(OutCmd.Team, team);
    this.ready = false;
  }

  shuffleTeams(): void {
    this.ws.send(OutCmd.ShuffleTeams);
  }

  pause(): void {
    this.ws.send(OutCmd.ChatCommand, '/pause');
  }

  private removeUser(id: number) {
    this.resetUser(id);
  }

  private resetUser(id: number, broadcast = true) {
    const teamPlayers = this.teamPlayers$.getValue();
    for (const index in teamPlayers) {
      const team = teamPlayers[index];
      if (!team) continue;
      teamPlayers[index] = team.filter((m) => m.sId !== id);
    }
    if (broadcast) this.teamPlayers$.next(teamPlayers);
  }

  private setTeam(id: number, team: number, broadcast = true) {
    this.resetUser(id, broadcast);
    if (team === 99) return;
    let user = this.fs.lobby$.getValue().find((m) => m.sId === id);
    if (!user) return;

    user = { ...user };
    const teamPlayers = this.teamPlayers$.getValue();
    while (teamPlayers.length <= team) teamPlayers.push([]);
    teamPlayers[team]?.push(user as TeamMessage);
  }

  updateJobbers(v: number | null): void {
    this.ws.send(OutCmd.SetMyJobbers, v ?? 100);
  }
}
