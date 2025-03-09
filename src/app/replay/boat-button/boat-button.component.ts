import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Boat } from '../../lobby/quacken/boats/boat';
import { TeamColorsCss } from '../../lobby/cadegoose/cade-entry-status/cade-entry-status.component';
import { ShipTypeMap } from '../../settings/ship-list/ship-list.component';

@Component({
  selector: 'q-boat-button',
  imports: [CommonModule, MatButtonModule, MatTooltipModule, MatIconModule],
  templateUrl: './boat-button.component.html',
  styleUrl: './boat-button.component.scss',
})
export class BoatButtonComponent {
  @Input() boat = new Boat('');
  @Input() active = false;
  @Input() fishNames = false;
  teamColors = TeamColorsCss;
  ShipTypeMap = ShipTypeMap;
}
