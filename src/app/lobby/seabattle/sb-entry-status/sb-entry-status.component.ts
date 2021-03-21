import { Component, EventEmitter, Output } from '@angular/core';
import { InCmd, Internal } from 'src/app/ws-messages';
import { Object3DIdCount } from 'three';
import { Stat, StatRow } from '../../cadegoose/stats/stats.component';
import { Lobby } from '../../lobby.component';
import { Turn } from '../../quacken/boats/boats.component';
import { EntryStatusComponent } from '../../quacken/entry-status/entry-status.component';

@Component({
  selector: 'q-sb-entry-status',
  templateUrl: './sb-entry-status.component.html',
  styleUrls: ['./sb-entry-status.component.scss']
})
export class SbEntryStatusComponent extends EntryStatusComponent {
  points = [0, 0];
  teams = ['Defender', 'Attacker'];
  time = '45:00';
  @Output() hoveredTeam = new EventEmitter<number>();

  ngOnInit() {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => this.updatePoints(t.stats)));
    this.subs.add(this.ws.subscribe(Internal.Lobby, (l: Lobby) => l.stats && this.updatePoints(l.stats)));
  }

  private updatePoints(stats: Record<number, StatRow>) {
    for (const s of Object.values(stats)) {
      this.points[s.team] = +s.stats[Stat.ShotsHit];
    }
  }
}
