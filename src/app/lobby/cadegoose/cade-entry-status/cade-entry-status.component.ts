import { Component, EventEmitter, Output } from '@angular/core';
import { EntryStatusComponent } from '../../quacken/entry-status/entry-status.component';
import { Turn } from '../../quacken/boats/boats.component';

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
    this.subs.add(this.ws.subscribe('turn', (t: Turn) => this.points = t.points));
  }

  openMenu() {
    this.ws.dispatchMessage({ cmd: '_openMenu' });
  }
}
