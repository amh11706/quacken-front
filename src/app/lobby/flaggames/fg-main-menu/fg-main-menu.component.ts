import { Component } from '@angular/core';
import { Settings, BoatSetting } from '../../../settings/setting/settings';
import { MainMenuComponent } from '../../cadegoose/main-menu/main-menu.component';

@Component({
  selector: 'q-fg-main-menu',
  templateUrl: './fg-main-menu.component.html',
  styleUrls: ['./fg-main-menu.component.scss'],
})
export class FgMainMenuComponent extends MainMenuComponent {
  boatTitles = (Settings.flagNextBoat as BoatSetting).titles;
}
