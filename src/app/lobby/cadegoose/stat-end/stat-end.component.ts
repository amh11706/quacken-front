import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { WsService } from 'src/app/ws.service';
import { Stat, StatRow } from '../stats/stats.component';

@Component({
  selector: 'q-stat-end',
  templateUrl: './stat-end.component.html',
  styleUrls: ['./stat-end.component.scss']
})
export class StatEndComponent implements OnChanges {
  Number = Number;
  @Input() stats?: Record<number, StatRow>;
  @Output() close = new EventEmitter<void>();
  scores: StatRow[] = [];
  myScore?: StatRow;
  pointValues = [5, 3, 0, 1, 0, 0, 10, 10];

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

  constructor(private ws: WsService) { }

  ngOnChanges(): void {
    if (!this.stats) return;
    if (this.ws.sId) {
      this.myScore = this.stats[this.ws.sId];
      if (this.myScore) {
        this.myScore = { ...this.myScore, stats: [...this.myScore.stats] };
      }
    }

    this.scores = Object.values(this.stats).sort((a, b) => b.score - a.score);
    for (const row of this.scores) {
      const s = row.stats;
      if (s[Stat.ShotsFired]) s[Stat.ShotsHit] += ` (${Math.round(+s[Stat.ShotsHit] / +s[Stat.ShotsFired] * 100)}%)`;
    }
  }

}
