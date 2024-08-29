import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WsService } from '../../../ws/ws.service';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { links } from '../../../settings/setting/setting.component';
import { SettingsService } from '../../../settings/settings.service';
import { TeamColorsCss, TeamNames } from '../cade-entry-status/cade-entry-status.component';
import { BoatSetting, Settings } from '../../../settings/setting/settings';
import { TeamMessage } from '../types';
import { MainMenuService } from './main-menu.service';

@Component({
  selector: 'q-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent {
  teamColors = TeamColorsCss;
  teamNames = TeamNames;
  boatTitles = (Settings.nextCadeBoat as BoatSetting).titles;
  voteOptions = [
    { icon: '', text: 'No vote' },
    { icon: 'pause', text: 'Voted pause' },
    { icon: 'play_arrow', text: 'Voted continue' },
    { icon: 'close', text: 'Voted forfeit' },
    { icon: 'handshake', text: 'Voted tie' },
  ];

  links = links;

  constructor(
    public ws: WsService,
    public es: EscMenuService,
    public ss: SettingsService,
    public ms: MainMenuService,
  ) { }

  trackTeamBy(index: number, _: TeamMessage[]): number {
    return index;
  }

  trackPlayerBy(index: number, m: TeamMessage): number {
    return m.sId || index;
  }

  plural(length: number): string {
    if (length === 1) return length + ' player';
    return length + ' players';
  }

  readyText(): string {
    if (this.ms.myBoat.isMe) return 'Close';
    if (this.ms.myTeam === 99) return 'Spectate';
    if (this.ms.ready) return 'Not Ready';
    return 'Ready';
  }
}
