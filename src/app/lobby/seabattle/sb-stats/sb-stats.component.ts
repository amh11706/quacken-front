import { Component, OnInit } from '@angular/core';
import { Stat, StatsComponent } from '../../cadegoose/stats/stats.component';

export const SB_STATS = [
  { stat: Stat.ShotsHit, title: 'Shots Hit' },
  { stat: Stat.ShotsFired, title: 'Fired' },
  { stat: Stat.ShotsTaken, title: 'Taken' },
];

@Component({
  selector: 'q-sb-stats',
  templateUrl: './sb-stats.component.html',
  styleUrls: ['./sb-stats.component.scss']
})
export class SbStatsComponent extends StatsComponent {
  columns = SB_STATS;

}
