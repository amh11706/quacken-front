import { Component, OnInit, ViewChild } from '@angular/core';
import * as dayjs from 'dayjs';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { MatSort } from '@angular/material/sort';

import { TeamImages } from '../../../chat/chat.service';
import { OutCmd } from '../../../ws-messages';
import { WsService } from '../../../ws.service';
import { StatService } from '../stat.service';
import { TeamPlayer } from './teams/teams.component';

const Results = ['N/A', 'Loss', 'Draw', 'Win'];

interface Match {
  matchId: number;
  rank: number;
  score: number;
  xp: number;
  tier: number;
  level: number;
  rankArea: number;
  createdAt: number;
  createdAtString: string;
  lobby: string;
  team: keyof typeof TeamImages;
  result: number;
  players: TeamPlayer[];
  teams: TeamPlayer[][];
}

@Component({
  selector: 'q-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss'],
})
export class MatchesComponent implements OnInit {
  matches: Match[][] = [[], [], [], []];
  teamImages = TeamImages;
  results = Results;

  dataSource = new TableVirtualScrollDataSource<Match>();
  displayedColumns = ['lobby', 'createdAtString', 'score', 'result', 'team', 'players', 'view'];
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    public ws: WsService,
    public stat: StatService,
  ) {
    this.dataSource.filterPredicate = (data: Match, filter: string) => {
      if (data.lobby.toLowerCase().indexOf(filter) !== -1) return true;
      if (data.createdAtString.toLowerCase().indexOf(filter) !== -1) return true;
      if (data.score.toString().indexOf(filter) !== -1) return true;
      if ((Results[data.result] as string).toLowerCase().indexOf(filter) !== -1) return true;
      for (const p of data.players) {
        if (p.from.toLowerCase().indexOf(filter) !== -1) return true;
      }
      return false;
    };
  }

  ngOnInit(): void {
    this.stat.profileTabChange$.subscribe(value => {
      if (value === 4) void this.fetchMatches();
    });
  }

  async fetchMatches(name = this.stat.target): Promise<void> {
    if (name !== this.stat.target) {
      this.stat.target = name;
      void this.stat.refresh();
    }
    const matches = await this.ws.request(OutCmd.MatchesUser, this.stat.target);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    // matches.push(...matches);
    this.matches = [[], [], [], []];
    let newest = { createdAt: 0 } as Match;
    for (const m of matches) {
      if (m.createdAt > newest.createdAt) newest = m;
      m.createdAtString = dayjs.unix(m.createdAt).format('D MMM YYYY HH:mm');
      m.teams = this.parseTeams(m.players);
      this.matches[m.rankArea - 1]?.push(m);
    }
    this.stat.group = (newest.rankArea ?? 2) - 1;

    if (!this.matches[this.stat.group]?.length) {
      for (let i = 0; i < this.matches.length; i++) if (this.matches[i]?.length) this.stat.group = i;
    }
    this.updateDataSource();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  updateDataSource(): void {
    this.dataSource.data = this.matches[this.stat.group] || [];
    setTimeout(() => {
      if (!this.dataSource.sort) {
        this.sort?.sort({ id: 'createdAtString', start: 'desc', disableClear: false });
      }
      this.dataSource.sort = this.sort || null;
    });
  }

  private parseTeams(players: TeamPlayer[]): TeamPlayer[][] {
    const teams: TeamPlayer[][] = [];
    for (const p of players) {
      if (p.team >= 99) continue;
      const team = teams[p.team] ?? [];
      team.push(p);
      teams[p.team] = team;
    }
    return teams;
  }

  openMatch(m: Match): void {
    window.open('/#/replay/' + m.matchId, '_blank');
  }

  imgSrc(team: keyof typeof TeamImages): string {
    return this.teamImages[team].src;
  }

  imgTitle(team: keyof typeof TeamImages): string {
    return this.teamImages[team].title;
  }
}
