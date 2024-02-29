import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatLegacyTooltipModule } from '@angular/material/legacy-tooltip';
import { TierTitles } from '../../esc-menu/profile/leaders/leaders.component';

@Component({
  selector: 'q-rank-circle',
  standalone: true,
  imports: [MatLegacyTooltipModule],
  templateUrl: './rank-circle.component.html',
  styleUrl: './rank-circle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankCircleComponent {
  @Input() score = 0;
  @Input() tier = 0;

  tierTitles = TierTitles;
}
