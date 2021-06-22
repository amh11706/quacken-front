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
    private ws: WsService,
    public stat: StatService,
  ) { }

  async ngOnInit(): Promise<void> {
    const matches = await this.ws.request(OutCmd.MatchesUser);
    for (const m of matches) {
      m.createdAtString = moment(m.createdAt, 'X').format('lll');
      this.matches[m.rankArea - 1].push(m);
    }

    if (!this.matches[this.stat.group].length) {
      for (let i = 0; i < this.matches.length; i++) if (this.matches[i].length) this.stat.group = i;
    }
  }

  openMatch(m: Match): void {
    window.open('/#/replay/' + m.matchId, '_blank');
  }
}
