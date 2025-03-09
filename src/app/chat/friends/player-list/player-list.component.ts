import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamImages, TeamMessage } from '../../../lobby/cadegoose/types';

@Component({
  selector: 'q-player-list',
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlayerListComponent {
  teamImages = TeamImages;
  @Input() showCount = true;

  private _players: TeamMessage[] = [];
  @Input() set players(v: TeamMessage[]) {
    this._players = v.filter(user => !user.h);
  }

  get players() {
    return this._players;
  }
}
