import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TeamImages } from '../../chat.service';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'q-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerListComponent {
  teamImages = TeamImages;

  constructor(public fs: FriendsService) { }
}
