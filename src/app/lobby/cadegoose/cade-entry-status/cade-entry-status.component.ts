import { Component, EventEmitter, Output } from '@angular/core';
import { EntryStatusComponent } from '../../quacken/entry-status/entry-status.component';
import { Turn } from '../../quacken/boats/boats.component';
import { InCmd, Internal } from 'src/app/ws-messages';
import { Lobby } from '../../lobby.component';

@Component({
  selector: 'q-cade-entry-status',
  templateUrl: './cade-entry-status.component.html',
  styleUrls: ['./cade-entry-status.component.scss']
})
export class CadeEntryStatusComponent extends EntryStatusComponent {
  points = [0, 0];
  teams = ['Defender', 'Attacker'];
  time = '45:00';
  @Output() hoveredTeam = new EventEmitter<number>();

  ngOnInit() {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => this.points = t.points));
    this.subs.add(this.ws.subscribe(Internal.Boats, (l: Lobby) => this.points = l.points));
  }
}
