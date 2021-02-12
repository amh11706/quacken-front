import { Injectable } from '@angular/core';

import { WsService } from 'src/app/ws.service';
import { OutCmd } from 'src/app/ws-messages';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { Message } from 'src/app/chat/chat.service';

export interface Stat {
  statId: number;
  name: string;
  value: number;
  suffix?: number;
}

export interface Leader extends Message {
  name: string;
  value: number;
  details?: string;
  clean?: boolean;
  seed?: string;
}

export interface Column {
  title: string;
  property: keyof Leader;
}

const mapColumns: Column[] = [
  { title: 'Details', property: 'details' },
  { title: 'Fresh Seed', property: 'clean' },
  { title: 'Seed', property: 'seed' },
];

@Injectable({
  providedIn: 'root'
})
export class StatService {
  profileTab = 0;
  target = '';
  stats: Stat[] = [];

  id = 0;
  leaders: Leader[] = [];
  columns: Column[] = [];

  constructor(
    private ws: WsService,
    private fs: FriendsService,
  ) { }

  openUser(name: string) {
    this.target = name;
    this.refresh();
  }

  openLeaders(id: number) {
    this.id = id;
    this.refreshLeaders();
  }

  async refresh() {
    this.stats = [];
    this.stats = await this.ws.request(OutCmd.StatsUser, this.target);
  }

  async refreshLeaders() {
    this.leaders = [];
    const leaders = await this.ws.request(OutCmd.StatsTop, this.id);
    this.leaders = leaders;
    if (!leaders || !leaders.length) return;

    if (leaders[0].seed) this.columns = mapColumns;
    else this.columns = [];
    for (const l of leaders) {
      l.from = l.name;
      l.friend = this.fs.isFriend(l.name);
    }
  }
}
