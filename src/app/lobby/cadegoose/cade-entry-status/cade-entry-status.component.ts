import { Component, EventEmitter, Output, Input } from '@angular/core';
import { EntryStatusComponent } from '../../quacken/entry-status/entry-status.component';
import { Turn } from '../../quacken/boats/boats.component';
import { InCmd, Internal } from 'src/app/ws-messages';
import { Lobby } from '../../lobby.component';
import { Boat } from '../../quacken/boats/boat';

@Component({
  selector: 'q-cade-entry-status',
  templateUrl: './cade-entry-status.component.html',
  styleUrls: ['./cade-entry-status.component.scss']
})
export class CadeEntryStatusComponent extends EntryStatusComponent {
  points = [0, 0];
  teams = ['Defender', 'Attacker'];
  time = '45:00';
  @Input() myTeam?:number;
  @Output() hoveredTeam = new EventEmitter<number>();

  ngOnInit() {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => this.points = t.points));
    this.subs.add(this.ws.subscribe(Internal.Lobby, (l: Lobby) => this.points = l.points));
    console.log(this.myTeam);
  }
}
