import { Component, Input } from '@angular/core';
import { Descriptions } from '../create/create.component';
import { Lobby } from '../../lobby/lobby.component';

@Component({
  selector: 'q-lobby-card',
  templateUrl: './lobby-card.component.html',
  styleUrls: ['./lobby-card.component.scss'],
})
export class LobbyCardComponent {
  @Input() lobby = {} as Lobby;
  publicModes = ['Public', 'Public Invitation', 'Private'];
  descriptions = Descriptions;
  titles = { CadeGoose: 'Cadesim' } as any;
}
