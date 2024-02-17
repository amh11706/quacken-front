import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Descriptions } from '../create/create.component';
import { Lobby } from '../../lobby/cadegoose/types';

@Component({
  selector: 'q-lobby-card',
  templateUrl: './lobby-card.component.html',
  styleUrls: ['./lobby-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyCardComponent implements OnChanges {
  @Input() lobby = {} as Lobby;
  publicModes = ['Public', 'Public Invitation', 'Private'];
  descriptions = Descriptions;
  titles = { CadeGoose: 'Cadesim' } as any;
  showPlayers = false;

  ngOnChanges(): void {
    if (!Array.isArray(this.lobby.players)) this.lobby.players = Object.values(this.lobby.players);
  }
}
