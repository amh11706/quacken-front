import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ListLobby } from '../../lobby/cadegoose/types';
import { LobbyTypes } from '../../lobby/cadegoose/lobby-type';

@Component({
    selector: 'q-lobby-card',
    templateUrl: './lobby-card.component.html',
    styleUrls: ['./lobby-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LobbyCardComponent {
  @Input() lobby = {} as ListLobby;
  publicModes = ['Public', 'Public Invitation', 'Private'];
  titles = { CadeGoose: 'Blockade' } as any;
  showPlayers = false;

  description(lobby: ListLobby): string {
    return LobbyTypes[lobby.type].desc;
  }
}
