import { Injectable } from '@angular/core';

import { BehaviorSubject, distinctUntilChanged, filter, map } from 'rxjs';
import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { EscMenuService } from '../esc-menu.service';
import { UserRank, Leader, RankLeader, Stat, WinLoss } from './types';

const StatColumns = ['position', 'name', 'value'];
const StatColumnsWithReplay = [...StatColumns, 'replay'];

const placeholderRank = {
  name: 'Loading...',
  rankArea: 0,
  level: 0,
} as UserRank;

@Injectable({
  providedIn: 'root',
})
export class StatService {
  private _profileTab$ = new BehaviorSubject(0);
  profileTab$ = this._profileTab$.asObservable();
  target = this.ws.user?.name || '';

  id = 199;
  group = 1;
  leaders$ = new BehaviorSubject<Leader[] | null>(null);
  rankLeaders$ = new BehaviorSubject<{ tier: RankLeader[][], xp: RankLeader[][] } | null>(null);

  groups = {
    0: 'Quacken',
    1: 'Cadegoose',
    2: 'Sea Battle',
  };

  groupStats$ = new BehaviorSubject<Record<number, Stat[]>>({});
  userRanks: UserRank[] = [placeholderRank];
  columns = StatColumns;

  winLoss: WinLoss = { wins: 0, losses: 0 };

  constructor(
    private ws: WsService,
    private es: EscMenuService,
    private kbs: KeyBindingService,
  ) {
    this.es.queryParams$.pipe(
      filter(p => p.profileTab !== undefined),
      map(p => +p.profileTab),
      distinctUntilChanged(),
    ).subscribe(v => {
      this._profileTab$.next(v);
    });
  }

  async updateWinLoss(): Promise<void> {
    const winLoss = await this.ws.request(OutCmd.GetWinLoss, { name: this.target, rankArea: this.group + 1 });
    this.winLoss = winLoss || { wins: 0, losses: 0 };
  }

  setTab(tab: number) {
    return this.es.openTab(1, false, { profileTab: tab });
  }

  openUser(name: string, open = true) {
    this.target = name;
    void this.refresh();
    if (open) {
      void this.setTab(0);
    }
  }

  openUserMatches(): void {
    void this.refresh();
    void this.setTab(4);
  }

  openLeaders(id: number) {
    this.id = id;
    void this.refreshLeaders();
    return this.setTab(3);
  }

  async refresh(): Promise<void> {
    this.userRanks = [placeholderRank];
    this.userRanks = await this.ws.request(OutCmd.RanksUser, this.target) || [];
    if (this.userRanks !== undefined) {
      for (const rank of this.userRanks) {
        rank.progress = (rank.xp - (rank.prevXp || 0)) * 100 / (rank.nextXp - (rank.prevXp || 0));
        rank.title = rank.xp?.toLocaleString() + ' xp, next level in: ' +
          (rank.nextXp - rank.xp)?.toLocaleString() + ' xp';
      }
      const stats = await this.ws.request(OutCmd.StatsUser, this.target);

      this.fillGroupStats(stats || []);
    }
    return this.updateWinLoss();
  }

  private fillGroupStats(stats: Stat[]) {
    const groupStats: Record<number, Stat[]> = {};
    for (const s of stats) {
      const group = Math.floor(s.id / 100);
      const arr = groupStats[group] || [];
      if (!arr.length) groupStats[group] = arr;
      arr.push(s);
    }
    this.groupStats$.next(groupStats);
  }

  changeGroup(): Promise<void> | void {
    this.leaders$.next(null);
    if (this.id % 100 === 99) {
      this.id = this.group * 100 + 99;
      return this.getRankLeaders();
    }
  }

  static formatLeader(stat: RankLeader) {
    stat.from = stat.userName;
    stat.ti = stat.tier;
    stat.sc = stat.score;
  }

  private async getRankLeaders() {
    const rankLeaders = await this.ws.request(OutCmd.RanksTop, this.group + 1);
    this.leaders$.next(null);
    if (!rankLeaders) return;

    for (const variation of rankLeaders.tier) {
      for (const l of variation) StatService.formatLeader(l);
    }
    for (const variation of rankLeaders.xp) {
      for (const l of variation) StatService.formatLeader(l);
    }
    this.rankLeaders$.next(rankLeaders);
  }

  async refreshLeaders(): Promise<void> {
    this.columns = StatColumns;
    if (!this.id) return;
    this.group = Math.floor(this.id / 100);
    if (this.id % 100 === 99) return this.getRankLeaders();

    const leaders = await this.ws.request(OutCmd.StatsTop, this.id);
    this.rankLeaders$.next(null);
    if (!leaders || !leaders.length) return;

    if (leaders[0]?.matchId) this.columns = StatColumnsWithReplay;
    for (const l of leaders) {
      l.from = l.name;
    }
    this.leaders$.next(leaders);
  }
}
