import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamImages, TeamMessage } from '../../../lobby/cadegoose/types';

@Component({
  selector: 'q-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerListComponent {
  teamImages = TeamImages;
  @Input() players: TeamMessage[] = [];
  @Input() showCount = true;
}
