import { Component, OnInit } from '@angular/core';

import { Boat } from '../quacken/boats/boat';
import { Settings } from 'src/app/settings/setting/settings';
import { QuackenComponent } from '../quacken/quacken.component';
import { SettingMap } from 'src/app/settings/settings.service';
import { Internal } from 'src/app/ws-messages';

const baseSettings: (keyof typeof Settings)[] = ['cadeMapScale', 'cadeSpeed'];
const ownerSettings: (keyof typeof Settings)[] = [
  'jobberQuality', 'cadePublicMode', 'cadeHotEntry',
  'cadeMaxPlayers', 'cadeMap',
];

@Component({
  selector: 'q-cadegoose',
  templateUrl: './cadegoose.component.html',
  styleUrls: ['./cadegoose.component.scss']
})
export class CadegooseComponent extends QuackenComponent implements OnInit {
  settings: SettingMap = { mapScale: 50, speed: 10 };
  hoveredTeam = -1;
  protected mapHeight = 36;
  protected mapWidth = 20;

  ngOnInit() {
    this.ss.getGroup('l/cade', true);
    this.ss.setLobbySettings([...baseSettings, ...ownerSettings]);

    this.sub = this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b);
  }

  async getSettings() {
    this.settings = await this.ss.getGroup('cade');
  }

}
