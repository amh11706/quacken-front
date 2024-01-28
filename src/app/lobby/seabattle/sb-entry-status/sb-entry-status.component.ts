import { Component, OnInit } from '@angular/core';
import { InCmd, Internal } from '../../../ws/ws-messages';
import { CadeEntryStatusComponent } from '../../cadegoose/cade-entry-status/cade-entry-status.component';
import { StatRow, Stat } from '../../cadegoose/stats/types';

@Component({
  selector: 'q-sb-entry-status',
  templateUrl: './sb-entry-status.component.html',
  styleUrls: ['./sb-entry-status.component.scss'],
})
export class SbEntryStatusComponent extends CadeEntryStatusComponent implements OnInit {
  ngOnInit(): void {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(InCmd.Turn, t => this.updatePoints(t.stats)));
    this.subs.add(this.ws.subscribe(Internal.Lobby, l => l.stats && this.updatePoints(l.stats)));
  }

  private updatePoints(stats: Record<number, StatRow>) {
    for (const s of Object.values(stats)) {
      this.points[s.team] = +(s.stats[Stat.ShotsHit] || 0);
    }
  }
}
