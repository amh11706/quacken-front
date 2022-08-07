import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { WsService } from '../../../ws.service';
import { TeamColorsCss } from '../cade-entry-status/cade-entry-status.component';
import { Stat, StatRow } from '../stats/stats.component';

@Component({
  selector: 'q-stat-end',
  templateUrl: './stat-end.component.html',
  styleUrls: ['./stat-end.component.scss'],
})
export class StatEndComponent implements OnChanges {
  Number = Number;
  teamColors = TeamColorsCss;
  @Input() stats?: Record<number, StatRow>;
  @Input() rating = true;
  @Output() rateMap = new EventEmitter<number>();
  @Output() closeStats = new EventEmitter<void>();
  scores: StatRow[] = [];
  myScore?: StatRow;
  pointValues = [50, 25, 0, 10, 0, 0, 10, 20];

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

  constructor(private ws: WsService) { }

  ngOnChanges(): void {
    if (!this.stats) return;
    if (this.ws.sId) {
      this.myScore = this.stats[this.ws.sId];
      if (this.myScore) {
        this.myScore = { ...this.myScore, stats: [...this.myScore.stats] };
      }
    }

    this.scores = Object.values(this.stats).sort((a, b) => (b.score || 0) - (a.score || 0)).map(el => {
      return { ...el };
    });
    for (const row of this.scores) {
      row.stats = [...row.stats];
      const s = row.stats;
      const shotsFired = s[Stat.ShotsFired];
      if (shotsFired) s[Stat.ShotsHit] += ` (${Math.round(+(s[Stat.ShotsHit] || 0) / +shotsFired * 100)}%)`;
    }
  }

  close(): void {
    this.closeStats.emit();
  }
}
