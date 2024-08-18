import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Descriptions } from '../create/create.component';
import { ListLobby } from '../../lobby/cadegoose/types';

@Component({
  selector: 'q-lobby-card',
  templateUrl: './lobby-card.component.html',
  styleUrls: ['./lobby-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyCardComponent {
  @Input() lobby = {} as ListLobby;
  publicModes = ['Public', 'Public Invitation', 'Private'];
  descriptions = Descriptions;
  titles = { CadeGoose: 'Cadesim' } as any;
  showPlayers = false;
}
