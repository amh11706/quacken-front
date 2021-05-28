import { Component, OnInit, OnDestroy } from '@angular/core';
import { Message } from 'src/app/chat/chat.service';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { WsService } from 'src/app/ws.service';
import { Lobby } from '../../lobby.component';
import { Subscription } from 'rxjs';
import { Turn } from '../../quacken/boats/boats.component';
import { Boat } from '../../quacken/boats/boat';
import { InCmd, Internal, OutCmd } from 'src/app/ws-messages';
import { EscMenuService } from 'src/app/esc-menu/esc-menu.service';
import { links } from 'src/app/settings/setting/setting.component';
import { SettingsService } from 'src/app/settings/settings.service';
import { Sounds, SoundService } from 'src/app/sound.service';

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
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit, OnDestroy {
  boatTitles = [
    , , , , , , , , , , , , , , 'Sloop', 'Cutter', 'Dhow', 'Fanchuan', 'Longship', 'Baghlah', 'Merchant Brig', 'Junk',
    'War Brig', 'Merchant Galleon', 'Xebec', 'War Galleon', 'War Frigate', 'Grand Frigate'
  ];
  links = links;
  defenders: Message[] = [];
  attackers: Message[] = [];
  teams: { [key: number]: TeamMessage } = {};
  myBoat = new Boat('');
  myTeam = 99;
  ready = false;
  admin = false;
  statsOpen = false;
  private roundGoing = false;
  private subs = new Subscription();
  private firstJoin = true;

  constructor(
    public ws: WsService,
    private fs: FriendsService,
    public es: EscMenuService,
    private ss: SettingsService,
    private sound: SoundService,
  ) { }

  ngOnInit() {
    if (this.ws.fakeWs) this.ws = this.ws.fakeWs;
    if (this.fs.fakeFs) this.fs = this.fs.fakeFs;
    this.subs.add(this.ws.subscribe(Internal.Lobby, async (m: Lobby) => {
      if (m.turn === 1) this.sound.play(Sounds.BattleStart, 0, Sounds.Notification);
      this.roundGoing = m.turn && m.turn <= (await this.ss.get('l/cade', 'turns'))?.value || false;
      if (!m.players) return;
      if (this.firstJoin) {
        this.firstJoin = false;
        this.es.activeTab = 0;
      }
      this.teams = m.players;
      this.admin = m.owner || this.admin;
      this.ready = false;
      this.myTeam = 99;
      this.defenders = [];
      this.attackers = [];
      for (const [id, p] of Object.entries(this.teams)) {
        this.setTeam(+id, p.t);
        if (+id === this.ws.sId) {
          this.ready = p.r;
          this.myTeam = p.t;
        }
        let user = this.fs.lobby.find((mes) => mes.sId === +id);
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
      let user = this.fs.lobby.find((mes) => mes.sId === m.id);
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
      else if (!b.isMe && this.ws.connected) {
        this.es.open = true;
        this.es.activeTab = 0;
      }
      this.myBoat = b;
    }));
    this.subs.add(this.ws.subscribe(InCmd.Turn, async (t: Turn) => {
      for (const p of Object.values(this.teams)) p.r = false;
      this.roundGoing = t.turn <= (await this.ss.get('l/cade', 'turns')).value;
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
  }

  private gotBoat() {
    this.es.open = false;
    this.ready = false;
    for (const p of Object.values(this.teams)) p.r = false;
  }

  toggleReady() {
    if (this.myBoat.isMe) {
      this.es.open = false;
      return;
    }
    if (this.myTeam === 99) {
      this.es.open = false;
      return;
    }
    this.ready = !this.ready;
    this.ws.send(OutCmd.Ready, this.ready);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  joinTeam(team: number) {
    if (team === this.myTeam) team = 99;
    this.ws.send(OutCmd.Team, team);
    this.ready = false;
  }

  private removeUser(id: number) {
    this.resetUser(id);
    delete this.teams[id];
  }

  private resetUser(id: number) {
    this.defenders = this.defenders.filter((m) => m.sId !== id);
    this.attackers = this.attackers.filter((m) => m.sId !== id);
  }

  private setTeam(id: number, team: number) {
    this.resetUser(id);
    if (team === 99) return;
    let user = this.fs.lobby.find((m) => m.sId === id);
    if (!user) return;

    user = { ...user };
    user.message = this.teams[id];
    if (team === 0) this.defenders.push(user);
    else this.attackers.push(user);
    return;
  }

}
