/* eslint-disable no-unused-vars */
import { Component, Input, OnChanges } from '@angular/core';
import { TeamColorsCss, TeamNames } from '../cade-entry-status/cade-entry-status.component';

export interface StatRow {
  user: string; team: number; stats: (string | number)[]; score: number;
}

export const enum Stat {
  Kills,
  Assists,
  Deaths,
  ShotsHit,
  ShotsFired,
  ShotsTaken,
  PointsContested,
  PointsScored,
}

@Component({
  selector: 'q-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnChanges {
  @Input() stats?: Record<number, StatRow>;
  @Input() myTeam?: number;
  @Input() hoveredTeam?: number;
  @Input() statOpacity?: number;
  teams: StatRow[][] = [];
  teamColors = TeamColorsCss;
  teamNames = TeamNames;

  columns = [
    { stat: Stat.PointsScored, title: 'Points Scored' },
    { stat: Stat.PointsContested, title: 'Contested' },
    { stat: Stat.Kills, title: 'Enemies Sank' },
    { stat: Stat.Assists, title: 'Assists' },
    { stat: Stat.Deaths, title: 'Times Sank' },
    { stat: Stat.ShotsHit, title: 'Shots Hit' },
    { stat: Stat.ShotsFired, title: 'Fired' },
    { stat: Stat.ShotsTaken, title: 'Taken' },
  ];

  ngOnChanges(): void {
    if (!this.stats) return;

    this.teams = [];
    for (const row of Object.values(this.stats)) {
      const s = [...row.stats];
      if (s[Stat.ShotsFired]) s[Stat.ShotsHit] += ` (${Math.round(+s[Stat.ShotsHit] / +s[Stat.ShotsFired] * 100)}%)`;
      while (this.teams.length <= row.team) this.teams.push([]);
      this.teams[row.team].push({ ...row, stats: s });
    }

    for (const team of this.teams) {
      team.sort((a, b) => +b.stats[Stat.PointsScored] - +a.stats[Stat.PointsScored]);
    }
  }
}
