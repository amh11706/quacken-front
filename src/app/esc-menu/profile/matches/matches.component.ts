import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as dayjs from 'dayjs';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';
import { MatSort } from '@angular/material/sort';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Subject, debounceTime } from 'rxjs';

import { MatChipInputEvent } from '@angular/material/chips';
import { OutCmd } from '../../../ws/ws-messages';
import { WsService } from '../../../ws/ws.service';
import { StatService } from '../stat.service';
import { Match, TeamPlayer } from '../types';
import { TierTitles } from '../leaders/leaders.component';
import { RankArea, ActiveLobbyTypes, LobbyTypes } from '../../../lobby/cadegoose/lobby-type';
import { TeamImages } from '../../../lobby/cadegoose/types';

const Results = ['N/A', 'Loss', 'Draw', 'Win'];
const PlayerCountRegex = /^\d{1,2}$/;

function searchMatch(match: Match, term: string): boolean {
  if (term === 'rated') return match.rank > 0;
  if (term === 'unrated') return match.rank === 0;
  if (PlayerCountRegex.test(term)) return match.players.length === +term;

  if (match.lobby.toLowerCase().indexOf(term) !== -1) return true;
  if (match.createdAtString.toLowerCase().indexOf(term) !== -1) return true;
  if (match.score.toString().indexOf(term) !== -1) return true;
  if ((Results[match.result] as string).toLowerCase().indexOf(term) !== -1) return true;
  for (const p of match.players) {
    if (p.from.toLowerCase().indexOf(term) !== -1) return true;
  }
  return false;
}

@Component({
  selector: 'q-matches',
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MatchesComponent implements OnInit, OnDestroy {
  tierTitles = TierTitles;
  matches: Partial<Record<RankArea, Match[]>> = {};
  teamImages = TeamImages;
  results = Results;
  lobbyTypes = ActiveLobbyTypes;

  dataSource = new TableVirtualScrollDataSource<Match>();
  displayedColumns = ['lobby', 'createdAt', 'score', 'result', 'team', 'players', 'view'];
  @ViewChild(MatSort) sort?: MatSort;
  searchTerms: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  private filterChanges = new Subject<string>();
  private initTimer = 0;

  constructor(
    public ws: WsService,
    public stat: StatService,
    private cd: ChangeDetectorRef,
  ) {
    this.filterChanges.pipe(debounceTime(300)).subscribe(value => {
      this.dataSource.filter = value.trim().toLowerCase() || this.searchTerms[0] || '';
    });

    this.dataSource.filterPredicate = (data: Match, filter: string) => {
      if (!searchMatch(data, filter)) return false;

      for (const term of this.searchTerms) {
        if (term === filter) continue;
        if (!searchMatch(data, term)) return false;
      }
      return true;
    };
  }

  ngOnInit(): void {
    this.initTimer = window.setTimeout(() => this.fetchMatches(), 500);
  }

  ngOnDestroy(): void {
    clearTimeout(this.initTimer);
  }

  removeLastTag(): void {
    this.searchTerms.pop();
    this.applyFilter('');
  }

  async fetchMatches(name = this.stat.target): Promise<void> {
    if (name !== this.stat.target) {
      this.stat.target = name;
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
    this.matches = Object.values(LobbyTypes).reduce((acc, type) => {
      acc[type.id] = [];
      return acc;
    }, {} as this['matches']);
    if (!matches) return this.updateDataSource();
    let newest = { createdAt: 0 } as Match;
    for (const m of matches) {
      if (m.createdAt > newest.createdAt) newest = m;
      m.createdAtString = dayjs.unix(m.createdAt).format('D MMM YYYY HH:mm');
      m.teams = this.parseTeams(m.players);
      this.matches[m.rankArea]?.push(m);
    }
    const oldGroup = this.stat.group;
    this.stat.group = (newest.rankArea ?? RankArea.Cade);
    if (oldGroup !== this.stat.group) void this.stat.changeGroup();
    this.updateDataSource();
  }

  applyFilter(filterValue: string) {
    this.filterChanges.next(filterValue);
  }

  updateDataSource(): void {
    this.dataSource.data = this.matches[this.stat.group] || [];
    setTimeout(() => {
      if (!this.dataSource.sort) {
        this.sort?.sort({ id: 'createdAt', start: 'desc', disableClear: false });
      }
      this.dataSource.sort = this.sort || null;
    });
    this.cd.detectChanges();
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

  imgSrc(team: keyof typeof TeamImages): string {
    return this.teamImages[team].src;
  }

  imgTitle(team: keyof typeof TeamImages): string {
    return this.teamImages[team].title;
  }

  addSearchTerm(event: MatChipInputEvent): void {
    const value = (event.value || '').trim().toLowerCase();
    if (value) {
      this.searchTerms.push(value);
    }
    event.chipInput?.clear();
    this.applyFilter(this.searchTerms[0] || '');
  }

  removeSearchTerm(index: number): void {
    if (index >= 0) {
      this.searchTerms.splice(index, 1);
    }
    this.applyFilter(this.searchTerms[0] || '');
  }
}
