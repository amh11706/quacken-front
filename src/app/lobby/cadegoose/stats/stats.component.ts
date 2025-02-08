/* eslint-disable no-unused-vars */
import { Component, Input, OnChanges } from '@angular/core';
import { TeamColorsCss, TeamNames } from '../cade-entry-status/cade-entry-status.component';
import { Stat, StatRow } from './types';

export const extraColumns = [
  { stat: Stat.ShotsFriendly, title: 'Friendly Fire' },
  { stat: Stat.ShotsFriendlyTaken, title: 'Taken' },
  { stat: Stat.ShotsMissed, title: 'Shots Missed' },
  { stat: Stat.RocksBumped, title: 'Rock Bumps' },
  { stat: Stat.WhirlSpins, title: 'Whirl Spins' },
  { stat: Stat.WindRides, title: 'Wind Rides' },

  // { stat: Stat.LeftUsed, title: 'Lefts' },
  // { stat: Stat.ForwardUsed, title: 'Forwards' },
  // { stat: Stat.RightUsed, title: 'Rights' },
  // { stat: Stat.DoubleForwardUsed, title: 'Double Forwards' },
  // { stat: Stat.TurnInSpotUsed, title: 'TiS' },
  // { stat: Stat.ChainshotUsed, title: 'Chainshots' },
  // { stat: Stat.FlotsamUsed, title: 'Flotsams' },
];

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
  @Input() showExtra = false;
  teams: StatRow[][] = [];
  teamColors = TeamColorsCss;
  teamNames = TeamNames;

  @Input() columns = [
    { stat: Stat.PointsScored, title: 'Points Scored' },
    { stat: Stat.PointsContested, title: 'Contested' },
    { stat: Stat.Kills, title: 'Enemies Sank' },
    { stat: Stat.Assists, title: 'Assists' },
    { stat: Stat.Deaths, title: 'Times Sank' },
    { stat: Stat.ShotsHit, title: 'Shots Hit' },
    { stat: Stat.ShotsFired, title: 'Fired' },
    { stat: Stat.ShotsTaken, title: 'Taken' },
  ];

  extraColumns = extraColumns;

  ngOnChanges(): void {
    this.teams = [];
    if (!this.stats) return;

    for (const row of Object.values(this.stats)) {
      const s = { ...row.stats };
      const shotsFired = s[Stat.ShotsFired];
      if (shotsFired) s[Stat.ShotsHit] += ` (${Math.round(+(s[Stat.ShotsHit] || 0) / +shotsFired * 100)}%)`;
      while (this.teams.length <= row.team) this.teams.push([]);
      this.teams[row.team]?.push({ ...row, stats: s });
    }

    for (const team of this.teams) {
      team.sort((a, b) => +(b.stats[Stat.PointsScored] || 0) - +(a.stats[Stat.PointsScored] || 0));
    }
  }
}
