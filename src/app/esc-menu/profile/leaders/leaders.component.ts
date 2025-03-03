import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { StatService } from '../stat.service';
import { Variations } from '../../../chat/rank-circle/rank-circle.component';
import { ActiveLobbyTypes } from '../../../lobby/cadegoose/lobby-type';

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
  standalone: false,
})
export class LeadersComponent implements OnInit, OnDestroy {
  @Input() name?: string;
  tierTitles = TierTitles;
  variations = Variations;
  lobbyTypes = ActiveLobbyTypes;
  private initTimer = 0;

  constructor(
    public stat: StatService,
  ) { }

  ngOnInit(): void {
    this.initTimer = window.setTimeout(() => {
      void this.stat.refreshLeaders();
    }, 750);
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.initTimer);
  }
}
