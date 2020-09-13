import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Message } from 'src/app/chat/chat.service';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { WsService } from 'src/app/ws.service';
import { Lobby } from '../../lobby.component';
import { Subscription } from 'rxjs';
import { Turn } from '../../quacken/boats/boats.component';
import { Boat } from '../../quacken/boats/boat';

@Component({
  selector: 'q-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit, OnDestroy {
  defenders: Message[] = [];
  attackers: Message[] = [];
  teams: { [key: number]: { r: boolean, t: number } } = {};
  haveBoat = false;
  myTeam = 99;
  ready = false;
  admin = false;
  open = true;

  private subs = new Subscription();

  @Input() lobby?: Lobby;

  constructor(
    private ws: WsService,
    private fs: FriendsService,
  ) { }

  ngOnInit(): void {
    this.subs.add(this.ws.subscribe('_boats', (m: Lobby) => {
      if (!m.teams) return;
      this.open = true;
      this.teams = m.teams;
      this.admin = m.owner || this.admin;
      this.ready = false;
      this.myTeam = 99;
      this.defenders = [];
      this.attackers = [];
      for (const [id, p] of Object.entries(m.teams)) {
        this.setTeam(+id, p.t, p.r);
        if (+id === this.ws.sId) {
          this.ready = p.r;
          this.myTeam = p.t;
        }
      }
    }));
    this.subs.add(this.ws.subscribe('team', (m: { id: number, team: number }) => {
      if (!this.teams[m.id]) this.teams[m.id] = { r: false, t: 99 };
      if (m.id === this.ws.sId) this.myTeam = m.team;
      this.setTeam(m.id, m.team);
    }));
    this.subs.add(this.ws.subscribe('ready', (m: { id: number, r: boolean }) => {
      this.teams[m.id].r = m.r;
    }));
    this.subs.add(this.ws.subscribe('playerRemove', (m: Message) => {
      if (m.sId) this.removeUser(m.sId);
    }));
    this.subs.add(this.ws.subscribe('_myBoat', (b: Boat) => {
      if (b.isMe) this.gotBoat();
      else this.haveBoat = false;
    }));
    this.subs.add(this.ws.subscribe('turn', (t: Turn) => {
      if (t.turn <= 75) return;
      this.open = true;
      this.haveBoat = false;
      for (const p of Object.values(this.teams)) p.r = false;
    }));
    this.subs.add(this.ws.subscribe('_openMenu', () => {
      this.open = true;
    }));
  }

  private gotBoat() {
    this.open = false;
    this.ready = false;
    this.haveBoat = true;
    if (this.ws.sId) {
      const p = this.teams[this.ws.sId];
      if (p) p.r = false;
    }
  }

  toggleReady() {
    if (this.haveBoat) {
      this.open = false;
      return;
    }
    if (this.myTeam === 99) {
      this.open = false;
      return;
    }
    this.ready = !this.ready;
    this.ws.send('ready', this.ready);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  joinTeam(team: number) {
    if (team === this.myTeam) team = 99;
    this.ws.send('team', team);
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

  private setTeam(id: number, team: number, ready = false) {
    this.resetUser(id);
    this.teams[id].r = ready;
    if (team === 99) return;
    const user = this.fs.lobby.find((m) => m.sId === id);
    if (!user) return;

    if (team === 0) this.defenders.push(user);
    else this.attackers.push(user);
    return;
  }

}
