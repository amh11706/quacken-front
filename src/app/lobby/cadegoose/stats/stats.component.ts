import { Component, Input, OnChanges } from '@angular/core';
import { TeamColorsCss, TeamNames } from '../cade-entry-status/cade-entry-status.component';
import { Stat, StatRow } from './types';
import { DefaultExtraColumns, DefaultStatColumns } from '../main-menu/main-menu.service';

@Component({
  selector: 'q-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  standalone: false,
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

  @Input() columns = DefaultStatColumns;
  @Input() extraColumns = DefaultExtraColumns;

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
