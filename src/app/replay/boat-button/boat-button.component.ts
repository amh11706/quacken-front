import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Boat } from '../../lobby/quacken/boats/boat';
import { TeamColorsCss } from '../../lobby/cadegoose/cade-entry-status/cade-entry-status.component';

@Component({
  selector: 'q-boat-button',
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule],
  templateUrl: './boat-button.component.html',
  styleUrls: ['./boat-button.component.scss']
})
export class BoatButtonComponent {
  @Input() boat = new Boat('');
  @Input() active = false;
  @Input() fishNames = false;
  teamColors = TeamColorsCss;
}
