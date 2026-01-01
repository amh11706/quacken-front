import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { WsService } from '../../../ws/ws.service';
import { TeamColorsCss } from '../cade-entry-status/cade-entry-status.component';
import { StatRow, Stat } from '../stats/types';
import { DefaultExtraColumns, DefaultStatColumns } from '../main-menu/main-menu.service';

@Component({
  selector: 'q-stat-end',
  templateUrl: './stat-end.component.html',
  styleUrl: './stat-end.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StatEndComponent implements OnChanges {
  private ws = inject(WsService);

  Number = Number;
  teamColors = TeamColorsCss;
  @Input() stats?: Record<number, StatRow>;
  @Input() rating = true;
  @Output() rateMap = new EventEmitter<number>();
  @Output() closeStats = new EventEmitter<void>();
  scores: StatRow[] = [];
  myScore?: StatRow;
  pointValues = [50, 25, 0, 10, 0, 0, 10, 20];

  @Input() columns = DefaultStatColumns;
  @Input() extraColumns = DefaultExtraColumns;

  showExtra = 0;

  ngOnChanges(): void {
    if (!this.stats) return;
    if (this.ws.sId) {
      this.myScore = this.stats[this.ws.sId];
      if (this.myScore) {
        this.myScore = { ...this.myScore, stats: { ...this.myScore.stats } };
      }
    }

    this.scores = Object.values(this.stats).sort((a, b) => (b.score || 0) - (a.score || 0)).map(el => {
      return { ...el };
    });
    for (const row of this.scores) {
      row.stats = { ...row.stats };
      const s = row.stats;
      const shotsFired = s[Stat.ShotsFired];
      if (shotsFired) s[Stat.ShotsHit] += ` (${Math.round(+(s[Stat.ShotsHit] || 0) / +shotsFired * 100)}%)`;
    }
  }

  close(): void {
    this.closeStats.emit();
  }
}
