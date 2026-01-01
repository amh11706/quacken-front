import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Settings, BoatSetting } from '../../../settings/setting/settings';
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
  styleUrl: './fg-main-menu.component.scss',
  standalone: false,
})
export class FgMainMenuComponent extends MainMenuComponent {
  private dialog = inject(MatDialog);

  columns = FgColumns;

  constructor() {
    super();

    this.ms.group = 'l/flaggames';
  }

  override boatTitles = (Settings.flagNextBoat as BoatSetting).titles;

  openHelp(): void {
    this.dialog.open(FgHelpComponent, { maxWidth: '600px', maxHeight: '80vh' });
  }
}
