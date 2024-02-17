import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { FriendsService } from '../../../chat/friends/friends.service';
import { WsService } from '../../../ws/ws.service';
import { InCmd, Internal, OutCmd } from '../../../ws/ws-messages';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { links } from '../../../settings/setting/setting.component';
import { SettingsService } from '../../../settings/settings.service';
import { Sounds, SoundService } from '../../../sound.service';
import { Boat } from '../../quacken/boats/boat';
import { TeamColorsCss, TeamNames } from '../cade-entry-status/cade-entry-status.component';
import { BoatSetting, SettingGroup, Settings } from '../../../settings/setting/settings';
import { Lobby, TeamMessage } from '../types';
import { MoveMessageIncoming } from '../../quacken/boats/types';

@Component({
  selector: 'q-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent implements OnInit, OnDestroy {
  teamColors = TeamColorsCss;
  teamNames = TeamNames;
  boatTitles = (Settings.nextCadeBoat as BoatSetting).titles;

  links = links;
  teamPlayers$ = new BehaviorSubject<TeamMessage[][]>([]);
  myBoat = new Boat('');
  myTeam = 99;
  myJobbers = 100;
  ready = false;
  statsOpen = false;
  roundGoing = false;
  settings = this.ss.prefetch('l/cade');
  private subs = new Subscription();
  private firstJoin = true;
  protected group = 'l/cade' as SettingGroup;
  private lobby?: Lobby;

  constructor(
    public ws: WsService,
    private fs: FriendsService,
    public es: EscMenuService,
    public ss: SettingsService,
    private sound: SoundService,
  ) { }

  ngOnInit(): void {
    if (this.ws.fakeWs) this.ws = this.ws.fakeWs;
    if (this.fs.fakeFs) this.fs = this.fs.fakeFs;
    this.subs.add(this.ws.subscribe(Internal.Lobby, async m => {
      this.lobby = m;
      if (m.turn === 1) void this.sound.play(Sounds.BattleStart, 0, Sounds.Notification);
      const maxTurns = m.maxTurns || 60;
      this.roundGoing = (maxTurns && m.turn && m.turn <= maxTurns) || false;
      if (this.firstJoin) {
        this.firstJoin = false;
        this.es.activeTab = 0;
      }
      // wait to make sure we parsed the lobby users first
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.ready = false;
      this.myTeam = 99;
      const teamPlayers = this.teamPlayers$.getValue();
      for (let i = 0; i < m.points.length; i++) teamPlayers.push([]);
      this.teamPlayers$.next(teamPlayers);

      if (m.myMoves) {
        const ms = m.myMoves as MoveMessageIncoming;
        this.ws.dispatchMessage({ cmd: Internal.MyMoves, data: { moves: ms.m, shots: ms.s || [] } });
      }
      if (m.moves) {
        this.ws.dispatchMessage({ cmd: InCmd.Moves, data: m.moves as MoveMessageIncoming[] });
      }
    }));
    this.subs.add(this.ws.subscribe(InCmd.PlayerList, r => {
      this.teamPlayers$.next(Array(this.teamPlayers$.getValue().length).fill([]));
      this.updatePlayers(Object.values(r) as TeamMessage[]);
    }));
    this.subs.add(this.ws.subscribe(InCmd.Team, m => {
      this.updatePlayers([m]);
    }));
    this.subs.add(this.ws.subscribe(InCmd.PlayerRemove, m => {
      if (m.sId) this.removeUser(m.sId);
    }));
    this.subs.add(this.ws.subscribe(Internal.MyBoat, b => {
      if (!this.roundGoing && this.ws.connected) {
        this.myBoat.isMe = false;
        this.es.open$.next(true);
        this.es.activeTab = 0;
        return;
      }
      if (b.isMe && !this.myBoat.isMe) this.gotBoat();
      this.myBoat = b;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Turn, async t => {
      for (const p of this.fs.lobby$.getValue()) p.r = false;
      const maxTurns = (await this.ss.get(this.group, 'turns'))?.value;
      this.roundGoing = (maxTurns && t.turn && t.turn < maxTurns) || false;
      this.statsOpen = false;
      if (this.roundGoing) return;
      if (this.lobby) this.lobby.turn = 0;
      this.es.lobbyContext.stats = t.stats;
      this.statsOpen = !!(t.stats && Object.keys(t.stats).length);
      this.myBoat = new Boat('');
    }));
    this.subs.add(this.ws.subscribe(InCmd.Sync, () => {
      if (!this.roundGoing && this.ws.connected) {
        this.es.open$.next(true);
        this.es.activeTab = 0;
        this.es.lobbyTab = 0;
        this.teamPlayers$.next(this.teamPlayers$.getValue());
      }
    }));
    this.subs.add(this.settings.teams.stream.subscribe((v) => {
      const teamPlayers = this.teamPlayers$.getValue();
      if (v < teamPlayers.length) {
        teamPlayers.length = v;
        this.teamPlayers$.next(teamPlayers);
        return;
      }
      while (teamPlayers.length < v) teamPlayers.push([]);
      this.teamPlayers$.next(teamPlayers);
    }));
  }

  private updatePlayers(players: TeamMessage[]) {
    const fsPlayers = this.fs.lobby$.getValue();
    for (const t of players) {
      const user = fsPlayers.find((mes) => mes.sId === t.sId);
      if (!user?.sId) continue;
      Object.assign(user, t);
      if (t.sId === this.ws.sId) {
        this.myTeam = t.t ?? 99;
        this.ready = t.r ?? false;
        this.ss.admin$.next(t.a ?? false);
        this.fs.allowInvite = t.a ?? false;
      }
      this.setTeam(user.sId, t.t ?? 99, false);
    }
    this.teamPlayers$.next(this.teamPlayers$.getValue());
  }

  submitRating(value: number): void {
    this.ws.send(OutCmd.RateMap, value);
  }

  private gotBoat() {
    this.es.open$.next(false);
    this.ready = false;
    for (const p of Object.values(this.fs.lobby$.getValue())) p.r = false;
  }

  toggleReady(): void {
    if (this.myBoat.isMe) {
      this.es.open$.next(false);
      return;
    }
    if (this.myTeam === 99) {
      this.es.open$.next(false);
      return;
    }
    this.ready = !this.ready;
    this.ws.send(OutCmd.Ready, { ready: this.ready });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  joinTeam(team: number): void {
    if (team === this.myTeam) team = 99;
    this.ws.send(OutCmd.Team, team);
    this.ready = false;
  }

  shuffleTeams(): void {
    this.ws.send(OutCmd.ShuffleTeams);
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

  plural(length: number): string {
    if (length === 1) return length + ' player';
    return length + ' players';
  }

  readyText(): string {
    if (this.myBoat.isMe) return 'Close';
    if (this.myTeam === 99) return 'Spectate';
    if (this.ready) return 'Not Ready';
    return 'Ready';
  }
}
