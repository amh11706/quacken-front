import { Component } from '@angular/core';
import { FriendsService } from '../friends.service';

@Component({
  selector: 'q-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
  constructor(public fs: FriendsService) { }
}
