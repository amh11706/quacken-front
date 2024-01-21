import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';

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
  result: keyof typeof Results;
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

  constructor(
    public ws: WsService,
    public stat: StatService,
  ) { }

  ngOnInit(): void {
    void this.fetchMatches();
  }

  async fetchMatches(name = this.stat.target): Promise<void> {
    this.stat.target = name;
    void this.stat.refresh();
    this.matches = [[], [], [], []];
    const matches = await this.ws.request(OutCmd.MatchesUser, this.stat.target);
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
}
