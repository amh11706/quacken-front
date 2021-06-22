/* eslint-disable no-unused-vars */
import { Component, Input, OnChanges } from '@angular/core';

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
  defenders: StatRow[] = [];
  attackers: StatRow[] = [];

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

  constructor() { }

  ngOnChanges() {
    if (!this.stats) return;

    this.defenders = [];
    this.attackers = [];
    for (const row of Object.values(this.stats)) {
      const s = [...row.stats];
      if (s[Stat.ShotsFired]) s[Stat.ShotsHit] += ` (${Math.round(+s[Stat.ShotsHit] / +s[Stat.ShotsFired] * 100)}%)`;
      (row.team === 0 ? this.defenders : this.attackers).push({ ...row, stats: s });
    }

    this.defenders.sort((a, b) => +b.stats[Stat.PointsScored] - +a.stats[Stat.PointsScored]);
    this.attackers.sort((a, b) => +b.stats[Stat.PointsScored] - +a.stats[Stat.PointsScored]);
  }
}
