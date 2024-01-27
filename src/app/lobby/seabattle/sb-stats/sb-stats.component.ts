import { Component, Input } from '@angular/core';
import { StatsComponent } from '../../cadegoose/stats/stats.component';
import { Stat } from '../../cadegoose/stats/types';

export const SB_STATS = [
  { stat: Stat.ShotsHit, title: 'Shots Hit' },
  { stat: Stat.ShotsFired, title: 'Fired' },
  { stat: Stat.ShotsTaken, title: 'Taken' },
];

@Component({
  selector: 'q-sb-stats',
  templateUrl: './sb-stats.component.html',
  styleUrls: ['./sb-stats.component.scss'],
})
export class SbStatsComponent extends StatsComponent {
  columns = SB_STATS;
  @Input() myTeam?: number;
  @Input() hoveredTeam?: number;
  @Input() statOpacity?: number;
}
