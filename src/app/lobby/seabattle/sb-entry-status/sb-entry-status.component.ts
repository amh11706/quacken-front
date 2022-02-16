import { Component, OnInit } from '@angular/core';
import { InCmd, Internal } from '../../../ws-messages';
import { Stat, StatRow } from '../../cadegoose/stats/stats.component';
import { Lobby } from '../../lobby.component';
import { Turn } from '../../quacken/boats/boats.component';
import { CadeEntryStatusComponent } from '../../cadegoose/cade-entry-status/cade-entry-status.component';

@Component({
  selector: 'q-sb-entry-status',
  templateUrl: './sb-entry-status.component.html',
  styleUrls: ['./sb-entry-status.component.scss'],
})
export class SbEntryStatusComponent extends CadeEntryStatusComponent implements OnInit {
  ngOnInit(): void {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => this.updatePoints(t.stats)));
    this.subs.add(this.ws.subscribe(Internal.Lobby, (l: Lobby) => l.stats && this.updatePoints(l.stats)));
  }

  private updatePoints(stats: Record<number, StatRow>) {
    for (const s of Object.values(stats)) {
      this.points[s.team] = +(s.stats[Stat.ShotsHit] || 0);
    }
  }
}
