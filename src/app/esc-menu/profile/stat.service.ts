import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';
import { WsService } from '../../ws.service';
import { OutCmd } from '../../ws-messages';
import { FriendsService } from '../../chat/friends/friends.service';
import { Message } from '../../chat/chat.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { EscMenuService } from '../esc-menu.service';

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
  providedIn: 'root',
})
export class StatService {
  profileTab = 0;
  profileTabChange$ = new Subject<number>();
  target = '';

  id = 0;
  group = 1;
  leaders$ = new BehaviorSubject<Leader[]>([]);
  rankLeaders$ = new BehaviorSubject<{ tier: RankLeader[], xp: RankLeader[] }>({ tier: [], xp: [] });
  columns: Column[] = [];

  groups = {
    0: 'Quacken',
    1: 'Cadegoose',
    2: 'Sea Battle',
  };

  groupStats?: { [key: number]: Stat[] };
  userRanks: UserRank[] = [];

  winLoss: {
    wins: number;
    losses: number;
    winsVsMe?: number;
    lossesVsMe?: number;
  } = { wins: 0, losses: 0 };

  constructor(
    private ws: WsService,
    private fs: FriendsService,
    private es: EscMenuService,
    private kbs: KeyBindingService,
  ) { }

  async updateWinLoss(): Promise<void> {
    this.winLoss = await this.ws.request(OutCmd.GetWinLoss, { name: this.target, rankArea: this.group + 1 });
  }

  emitTab(): void {
    this.profileTabChange$.next(this.profileTab);
  }

  setTab(tab: number): void {
    this.profileTab = tab;
  }

  openUser(name: string, open = true): void {
    this.target = name;
    void this.refresh();
    if (open) {
      this.kbs.emitAction(KeyActions.OpenProfile);
      this.es.open = true;
    }
    this.setTab(0);
  }

  openUserMatches(open = true): void {
    void this.refresh();
    if (open) {
      this.kbs.emitAction(KeyActions.OpenProfile);
      this.es.open = true;
    }
    this.setTab(4);
  }

  openLeaders(id: number): Promise<void> {
    this.id = id;
    return this.refreshLeaders();
  }

  async refresh(): Promise<void> {
    this.userRanks = [];
    this.userRanks = await this.ws.request(OutCmd.RanksUser, this.target);
    if (this.userRanks !== undefined) {
      for (const rank of this.userRanks) {
        rank.progress = (rank.xp - (rank.prevXp || 0)) * 100 / (rank.nextXp - (rank.prevXp || 0));
        rank.title = rank.xp?.toLocaleString() + ' xp, next level in: ' +
          (rank.nextXp - rank.xp)?.toLocaleString() + ' xp';
      }
      const stats = await this.ws.request(OutCmd.StatsUser, this.target);

      this.fillGroupStats(stats);
    }
    return this.updateWinLoss();
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

  changeGroup(): Promise<void> | void {
    this.leaders$.next([]);
    if (this.id % 100 === 99) {
      this.id = this.group * 100 + 99;
      return this.getRankLeaders();
    }
  }

  private async getRankLeaders() {
    const rankLeaders = await this.ws.request(OutCmd.RanksTop, this.group + 1);
    if (!rankLeaders) return;

    for (const l of rankLeaders.tier) {
      l.from = l.userName;
      l.friend = this.fs.isFriend(l.userName);
    }
    for (const l of rankLeaders.xp) {
      l.from = l.userName;
      l.friend = this.fs.isFriend(l.userName);
    }
    this.rankLeaders$.next(rankLeaders);
  }

  async refreshLeaders(): Promise<void> {
    this.leaders$.next([]);
    this.rankLeaders$.next({ tier: [], xp: [] });
    if (!this.id) return;
    this.group = Math.floor(this.id / 100);
    if (this.id % 100 === 99) return this.getRankLeaders();

    const leaders = await this.ws.request(OutCmd.StatsTop, this.id);
    if (!leaders || !leaders.length) return;

    if (leaders[0].seed) this.columns = mapColumns;
    else this.columns = [];
    for (const l of leaders) {
      l.from = l.name;
      l.friend = this.fs.isFriend(l.name);
    }
    this.leaders$.next(leaders);
  }
}
