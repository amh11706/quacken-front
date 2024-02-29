import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StatService } from '../stat.service';
import { EscMenuService } from '../../esc-menu.service';

export const TierTitles = [
  'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3',
  'Gold 1', 'Gold 2', 'Gold 3',
  'Platinum 1', 'Platinum 2', 'Platinum 3',
  'Diamond 1', 'Diamond 2', 'Diamond 3',
  'Ace 1', 'Ace 2', 'Ace 3',
  'Jolly Roger',
];

@Component({
  selector: 'q-leaders',
  templateUrl: './leaders.component.html',
  styleUrls: ['./leaders.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadersComponent {
  @Input() name?: string;
  tierTitles = TierTitles;

  constructor(
    public stat: StatService,
    private esc: EscMenuService,
  ) {
    this.stat.profileTabChange$.subscribe(value => {
      if (value === 3) void this.stat.refreshLeaders();
    });
    this.esc.activeTab$.subscribe(value => {
      if (value === 1 && this.stat.profileTab === 3) void this.stat.refreshLeaders();
    });
  }
}
