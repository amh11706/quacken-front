import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { Settings, BoatSetting } from '../../../settings/setting/settings';
import { SettingsService } from '../../../settings/settings.service';
import { WsService } from '../../../ws/ws.service';
import { MainMenuComponent } from '../../cadegoose/main-menu/main-menu.component';
import { FgHelpComponent } from '../fg-help/fg-help.component';
import { Stat } from '../../cadegoose/stats/types';
import { MainMenuService } from '../../cadegoose/main-menu/main-menu.service';

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
  styleUrl: './fg-main-menu.component.scss',
  standalone: false,
})
export class FgMainMenuComponent extends MainMenuComponent {
  columns = FgColumns;

  constructor(
    ws: WsService,
    es: EscMenuService,
    ss: SettingsService,
    private dialog: MatDialog,
    ms: MainMenuService,
  ) {
    super(ws, es, ss, ms);
    this.ms.group = 'l/flaggames';
  }

  boatTitles = (Settings.flagNextBoat as BoatSetting).titles;

  openHelp(): void {
    this.dialog.open(FgHelpComponent, { maxWidth: '600px', maxHeight: '80vh' });
  }
}
