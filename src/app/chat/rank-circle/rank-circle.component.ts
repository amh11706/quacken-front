import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TierTitles } from '../../esc-menu/profile/leaders/leaders.component';

@Component({
  selector: 'q-rank-circle',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './rank-circle.component.html',
  styleUrl: './rank-circle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankCircleComponent {
  @Input() score = 0;
  @Input() tier = 0;

  tierTitles = TierTitles;
}
