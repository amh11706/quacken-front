import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ListLobby } from '../../lobby/cadegoose/types';
import { LobbyTypes } from '../../lobby/cadegoose/lobby-type';
import { DBSetting } from '../../settings/types';

@Component({
  selector: 'q-lobby-card',
  templateUrl: './lobby-card.component.html',
  styleUrl: './lobby-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LobbyCardComponent {
  @Input() lobby = {} as ListLobby;
  publicModes = ['Public', 'Public Invitation', 'Private'];
  titles = { CadeGoose: 'Blockade' } as Record<string, string>;
  showPlayers = false;

  description(lobby: ListLobby): string {
    return LobbyTypes[lobby.type].desc;
  }

  label(s: DBSetting, fallback = ''): string {
    if (typeof s.data === 'string') return s.data;
    if (typeof s.data === 'object' && s.data) return s.data['label'] as string;
    return fallback || String(s.value);
  }
}
