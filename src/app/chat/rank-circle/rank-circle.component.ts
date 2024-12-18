import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TierTitles } from '../../esc-menu/profile/leaders/leaders.component';
import { CommonModule } from '@angular/common';

export const Variations: Record<number, string[]> = {
  1: ['1v1', 'Teams'],
}

@Component({
  selector: 'q-rank-circle',
  standalone: true,
  imports: [MatTooltipModule, CommonModule],
  templateUrl: './rank-circle.component.html',
  styleUrl: './rank-circle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankCircleComponent {
  @Input() score: number | number[] = 0;
  @Input() tier: number | number[] = 0;
  bestTier = 0;
  title = '';

  tierTitles = TierTitles;

  ngOnChanges(): void {
    if (typeof this.tier === 'number') this.tier = [this.tier];
    if (typeof this.score === 'number') this.score = [this.score];
    this.bestTier = Math.max(...this.tier);
    this.title = this.tierTitles[this.bestTier] || '';
    if (this.score.length === 1) {
      this.title += ' (' + this.score[0] + ')';
      return;
    }

    this.title += ' (' ;
    for (const [i, score] of this.score.entries()) {
      if (i) this.title += ', ';
      this.title += Variations[1]![i] + ': ' + score;
    }
    this.title += ')';
  }
}
