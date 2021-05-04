import { Injectable } from '@angular/core';

import { WsService } from 'src/app/ws.service';
import { OutCmd } from 'src/app/ws-messages';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { Message } from 'src/app/chat/chat.service';
import { EscMenuService } from '../esc-menu.service';
import { KeyBindingService } from 'src/app/settings/key-binding/key-binding.service';
import { KeyActions } from 'src/app/settings/key-binding/key-actions';

export interface Stat {
  id: number;
  name: string;
  value: number;
  suffix?: number;
}

interface Leader extends Message {
  name: string;
  value: number;
  details?: string;
  clean?: boolean;
  seed?: string;
}

interface RankLeader extends Message {
  userName: string;
  level: number;
  tier: number;
}

export interface UserRank {
  name: string;
  level: number;
  tier: number;
  rankArea: number;
  xp: number;
  nextXp: number;
  prevXp: number;
  progress: number;
  title: string;
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

  id = 0;
  group = 0;
  leaders: Leader[] = [];
  columns: Column[] = [];
  rankLeaders?: { tier: RankLeader[], xp: RankLeader[] };

  groups = {
    0: 'Quacken',
    1: 'Cadegoose',
    2: 'Sea Battle',
  };

  groupStats?: { [key: number]: Stat[] };
  userRanks: UserRank[] = [];
  constructor(
    private ws: WsService,
    private fs: FriendsService,
    private es: EscMenuService,
    private kbs: KeyBindingService,
  ) { }

  openUser(name: string, open = true) {
    this.target = name;
    this.refresh();
    if (open) {
      this.kbs.emitAction(KeyActions.OpenProfile);
      this.es.open = true;
    }
    this.profileTab = 0;
  }

  openLeaders(id: number) {
    this.id = id;
    this.refreshLeaders();
  }

  async refresh() {
    this.userRanks = [];
    this.userRanks = await this.ws.request(OutCmd.RanksUser, this.target);
    for (const rank of this.userRanks) {
      rank.progress = (rank.xp - (rank.prevXp || 0)) * 100 / (rank.nextXp - (rank.prevXp || 0));
      rank.title = rank.xp?.toLocaleString() + ' xp, next level in: ' + (rank.nextXp - rank.xp)?.toLocaleString() + ' xp';
    }
    const stats = await this.ws.request(OutCmd.StatsUser, this.target);

    this.fillGroupStats(stats);
  }

  private fillGroupStats(stats: Stat[]) {
    this.groupStats = {};
    for (const s of stats) {
      const group = Math.floor(s.id / 100);
      const arr = this.groupStats[group] || [];
      if (!arr.length) this.groupStats[group] = arr;
      arr.push(s);
    }
  }

  changeGroup() {
    this.leaders = [];
    if (this.id % 100 === 99) {
      this.id = this.group * 100 + 99;
      this.getRankLeaders();
    }
  }

  private async getRankLeaders() {
    this.rankLeaders = await this.ws.request(OutCmd.RanksTop, this.group + 1);
    if (!this.rankLeaders) return;

    for (const l of this.rankLeaders.tier) {
      l.from = l.userName;
      l.friend = this.fs.isFriend(l.userName);
    }
    for (const l of this.rankLeaders.xp) {
      l.from = l.userName;
      l.friend = this.fs.isFriend(l.userName);
    }
  }

  async refreshLeaders() {
    this.leaders = [];
    delete this.rankLeaders;
    if (!this.id) return;
    this.group = Math.floor(this.id / 100);
    if (this.id % 100 === 99) return this.getRankLeaders();

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
