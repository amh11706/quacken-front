import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CadeDesc } from 'src/app/lobby/cadegoose/cadegoose.component';
import { QuackenDesc } from 'src/app/lobby/quacken/quacken.component';
import { SettingMap, SettingsService } from 'src/app/settings/settings.service';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';

export const Descriptions = {
  Quacken: QuackenDesc,
  HexaQuack: QuackenDesc,
  Spades: 'A classic card game.',
  CadeGoose: CadeDesc,
};

const groups = ['quacken', 'quacken', 'spades', 'cade'];

@Component({
  selector: 'q-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  created = false;
  settings: SettingMap = {};
  createGroup: SettingMap = {};
  idDescriptions = Object.values(Descriptions);

  private sub = new Subscription();

  constructor(public ws: WsService, private ss: SettingsService) { }

  ngOnInit(): void {
    this.sub.add(this.ws.connected$.subscribe(async v => {
      if (!v) return;
      this.ws.send(OutCmd.LobbyListJoin);
      this.settings = await this.ss.getGroup('l/create');
      this.changeType();
    }));
  }

  createLobby(): void {
    this.createGroup.createType = this.settings.createType;
    this.ws.send(OutCmd.LobbyCreate, this.createGroup);
    this.created = true;
  }

  async changeType() {
    this.createGroup = await this.ss.getGroup('l/' + groups[this.settings.createType], true);
  }

}
