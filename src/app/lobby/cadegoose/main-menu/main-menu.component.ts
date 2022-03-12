import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Message } from '../../../chat/chat.service';
import { FriendsService } from '../../../chat/friends/friends.service';
import { WsService } from '../../../ws.service';
import { InCmd, Internal, OutCmd } from '../../../ws-messages';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { links } from '../../../settings/setting/setting.component';
import { SettingPartial, SettingsService } from '../../../settings/settings.service';
import { Sounds, SoundService } from '../../../sound.service';
import { Boat } from '../../quacken/boats/boat';
import { Turn } from '../../quacken/boats/boats.component';
import { Lobby } from '../../lobby.component';
import { TeamColorsCss, TeamNames } from '../cade-entry-status/cade-entry-status.component';

interface TeamMessage {
  id: number;
  t: number;
  r: boolean;
  b: number;
  s: number;
}

@Component({
  selector: 'q-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit, OnDestroy {
  teamColors = TeamColorsCss;
  teamNames = TeamNames;
  // eslint-disable-next-line no-sparse-arrays
  boatTitles = [, , , , , , , , , , , , , ,
    'Sloop', 'Cutter', 'Dhow', 'Fanchuan', 'Longship', 'Baghlah', 'Merchant Brig', 'Junk',
    'War Brig', 'Merchant Galleon', 'Xebec', 'War Galleon', 'War Frigate', 'Grand Frigate',
  ];

  links = links;
  teamPlayers: Message[][] = [];
  teams: { [key: number]: TeamMessage } = {};
  myBoat = new Boat('');
  myTeam = 99;
  ready = false;
  admin = false;
  statsOpen = false;
  roundGoing = false;
  mapId: SettingPartial = { value: 0 };
  private subs = new Subscription();
  private firstJoin = true;

  constructor(
    public ws: WsService,
    private fs: FriendsService,
    public es: EscMenuService,
    private ss: SettingsService,
    private sound: SoundService,
  ) { }

  async ngOnInit(): Promise<void> {
    if (this.ws.fakeWs) this.ws = this.ws.fakeWs;
    if (this.fs.fakeFs) this.fs = this.fs.fakeFs;
    this.subs.add(this.ws.subscribe(Internal.Lobby, async (m: Lobby) => {
      if (m.turn === 1) void this.sound.play(Sounds.BattleStart, 0, Sounds.Notification);
      const maxTurns = (await this.ss.get('l/cade', 'turns'))?.value;
      this.roundGoing = (maxTurns && m.turn && m.turn <= maxTurns) || false;
      if (!m.players) return;
      if (this.firstJoin) {
        this.firstJoin = false;
        this.es.activeTab = 0;
      }
      this.teams = m.players;
      this.admin = m.owner ?? this.admin;
      this.ready = false;
      this.myTeam = 99;
      this.teamPlayers = [];
      for (let i = 0; i < m.points.length; i++) this.teamPlayers.push([]);
      for (const [id, p] of Object.entries(this.teams)) {
        this.setTeam(+id, p.t);
        if (+id === this.ws.sId) {
          this.ready = p.r;
          this.myTeam = p.t;
        }
        const user = this.fs.lobby.find((mes) => mes.sId === +id);
        if (!user) return;
        user.team = p.t;
      }
    }));
    this.subs.add(this.ws.subscribe(InCmd.Team, (m: TeamMessage) => {
      this.teams[m.id] = m;
      if (m.id === this.ws.sId) {
        this.myTeam = m.t;
        this.ready = m.r;
      }
      this.setTeam(m.id, m.t);
      const user = this.fs.lobby.find((mes) => mes.sId === m.id);
      if (!user) return;
      user.team = m.t;
    }));
    this.subs.add(this.ws.subscribe(InCmd.PlayerRemove, (m: Message) => {
      if (m.sId) this.removeUser(m.sId);
    }));
    this.subs.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => {
      if (!this.roundGoing && this.ws.connected) {
        this.myBoat.isMe = false;
        this.es.open = true;
        this.es.activeTab = 0;
        return;
      }
      if (b.isMe && !this.myBoat.isMe) this.gotBoat();
      this.myBoat = b;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Turn, async (t: Turn) => {
      for (const p of Object.values(this.teams)) p.r = false;
      const maxTurns = (await this.ss.get('l/cade', 'turns'))?.value;
      this.roundGoing = (maxTurns && t.turn <= maxTurns) || false;
      this.statsOpen = false;
      if (this.roundGoing) return;
      this.es.lobbyContext.stats = t.stats;
      this.statsOpen = !!(t.stats && Object.keys(t.stats).length);
      this.myBoat = new Boat('');
    }));
    this.subs.add(this.ws.subscribe(InCmd.Sync, () => {
      if (!this.roundGoing && this.ws.connected) {
        this.es.open = true;
        this.es.activeTab = 0;
      }
    }));

    this.mapId = await this.ss.get('l/cade', 'map') ?? this.mapId;
  }

  submitRating(value: number): void {
    this.ws.send(OutCmd.RateMap, value);
  }

  private gotBoat() {
    this.es.open = false;
    this.ready = false;
    for (const p of Object.values(this.teams)) p.r = false;
  }

  toggleReady(): void {
    if (this.myBoat.isMe) {
      this.es.open = false;
      return;
    }
    if (this.myTeam === 99) {
      this.es.open = false;
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
    delete this.teams[id];
  }

  private resetUser(id: number) {
    this.teamPlayers = this.teamPlayers.map(team => {
      return team.filter((m) => m.sId !== id);
    });
  }

  private setTeam(id: number, team: number) {
    this.resetUser(id);
    if (team === 99) return;
    let user = this.fs.lobby.find((m) => m.sId === id);
    if (!user) return;

    user = { ...user };
    user.message = this.teams[id];
    while (this.teamPlayers.length <= team) this.teamPlayers.push([]);
    this.teamPlayers[team]?.push(user);
  }

  public plural(length: number): string {
    if (length === 1) return length + ' player';
    return length + ' players';
  }
}
