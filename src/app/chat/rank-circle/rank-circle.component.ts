import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { TierTitles } from '../../esc-menu/profile/leaders/leaders.component';

export const Variations: Record<number, string[]> = {
  2: ['1v1', 'Teams'],
};

@Component({
    selector: 'q-rank-circle',
    imports: [MatTooltipModule, CommonModule],
    templateUrl: './rank-circle.component.html',
    styleUrl: './rank-circle.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankCircleComponent implements OnChanges {
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

    this.title += ' (';
    for (const [i, score] of this.score.entries()) {
      if (i) this.title += ', ';
      this.title += Variations[2]?.[i] + ': ' + score;
    }
    this.title += ')';
  }
}
