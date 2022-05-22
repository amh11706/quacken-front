import { Component, OnInit } from '@angular/core';
import moment from 'moment';

import { OutCmd } from '../../../ws-messages';
import { WsService } from '../../../ws.service';
import { StatService } from '../stat.service';

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
}

@Component({
  selector: 'q-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss'],
})
export class MatchesComponent implements OnInit {
  matches: Match[][] = [[], [], []];

  constructor(
    public ws: WsService,
    public stat: StatService,
  ) { }

  ngOnInit(): void {
    void this.fetchMatches();
  }

  async fetchMatches(name = this.stat.target): Promise<void> {
    this.stat.target = name;
    this.matches = [[], [], []];
    const matches = await this.ws.request(OutCmd.MatchesUser, this.stat.target);
    let newest = { createdAt: 0 } as Match;
    for (const m of matches) {
      if (m.createdAt > newest.createdAt) newest = m;
      m.createdAtString = moment(m.createdAt, 'X').format('lll');
      this.matches[m.rankArea - 1]?.push(m);
    }
    this.stat.group = (newest.rankArea ?? 2) - 1;

    if (!this.matches[this.stat.group]?.length) {
      for (let i = 0; i < this.matches.length; i++) if (this.matches[i]?.length) this.stat.group = i;
    }
  }

  openMatch(m: Match): void {
    window.open('/#/replay/' + m.matchId, '_blank');
  }
}
