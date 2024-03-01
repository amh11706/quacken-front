import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FriendsService } from '../../../chat/friends/friends.service';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { Settings, BoatSetting } from '../../../settings/setting/settings';
import { SettingsService } from '../../../settings/settings.service';
import { SoundService } from '../../../sound.service';
import { WsService } from '../../../ws/ws.service';
import { MainMenuComponent } from '../../cadegoose/main-menu/main-menu.component';
import { FgHelpComponent } from '../fg-help/fg-help.component';
import { Stat } from '../../cadegoose/stats/types';

export const FgColumns = [
  { stat: Stat.PointsScored, title: 'Flags Returned' },
  { stat: Stat.PointsContested, title: 'Flags Captured' },
  { stat: Stat.RocksBumped, title: 'Flags Stolen' },
  { stat: Stat.Kills, title: 'Enemies Sank' },
  { stat: Stat.Assists, title: 'Assists' },
  { stat: Stat.Deaths, title: 'Times Sank' },
  { stat: Stat.ShotsHit, title: 'Shots Hit' },
  { stat: Stat.ShotsFired, title: 'Fired' },
  { stat: Stat.ShotsTaken, title: 'Taken' },
];

@Component({
  selector: 'q-fg-main-menu',
  templateUrl: './fg-main-menu.component.html',
  styleUrls: ['./fg-main-menu.component.scss'],
})
export class FgMainMenuComponent extends MainMenuComponent {
  columns = FgColumns;

  constructor(
    ws: WsService,
    fs: FriendsService,
    es: EscMenuService,
    ss: SettingsService,
    sound: SoundService,
    private dialog: MatDialog,
  ) {
    super(ws, fs, es, ss, sound);
    this.group = 'l/flaggames';
  }

  boatTitles = (Settings.flagNextBoat as BoatSetting).titles;

  openHelp(): void {
    this.dialog.open(FgHelpComponent, { maxWidth: '600px', maxHeight: '80vh' });
  }
}
