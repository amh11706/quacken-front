import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { InCmd } from '../../../ws/ws-messages';
import { EntryStatusComponent } from '../../quacken/entry-status/entry-status.component';
import { TeamColors } from '../twod-render/gu-boats/gu-boat';

export const TeamColorsCss: Readonly<string[]> = TeamColors.map(c => `rgb(${c.join(', ')})`);
export const TeamNames: Readonly<string[]> = ['Defenders', 'Attackers', '2nd Attackers', '3rd Attackers'];

@Component({
  selector: 'q-cade-entry-status',
  templateUrl: './cade-entry-status.component.html',
  styleUrl: './cade-entry-status.component.scss',
  standalone: false,
})
export class CadeEntryStatusComponent extends EntryStatusComponent implements OnInit {
  points = [0, 0];
  time = '45:00';
  colors = TeamColorsCss;
  @Input() myTeam?: number;
  @Output() hoveredTeam = new EventEmitter<number>();

  ngOnInit(): void {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe(InCmd.Turn, t => { this.points = t.points; }));
    this.subs.add(this.lobbyService.get().subscribe(l => {
      l?.points && (this.points = l.points);
    }));
  }

  getScore(team: number): string {
    const points = this.points[team] || 0;
    return points < 0 ? `${-points - 1} F` : points.toString();
  }
}
