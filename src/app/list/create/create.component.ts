import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { CadeDesc } from '../../lobby/cadegoose/cadegoose.component';
import { QuackenDesc } from '../../lobby/quacken/quacken.component';
import { SbDesc } from '../../lobby/seabattle/seabattle.component';
import { SettingsService } from '../../settings/settings.service';
import { ServerSettingGroup, SettingGroup, SettingName } from '../../settings/setting/settings';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { ServerSettingMap } from '../../settings/types';
import { FgDesc } from '../../lobby/flaggames/flaggames.component';
import { BoardadmiralDesc } from '../../lobby/boardadmiral/boardadmiral.component';

export const Descriptions = {
  Quacken: QuackenDesc,
  Spades: 'A classic card game.',
  CadeGoose: CadeDesc,
  SeaBattle: SbDesc,
  FlagGames: FgDesc,
  mapinfo: 'View map information.',
  BA: BoardadmiralDesc,
};

const groups = ['quacken', 'spades', 'cade', 'cade', 'flaggames'];

@Component({
  selector: 'q-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements OnInit, OnDestroy {
  created = false;
  settings = this.ss.prefetch('l/create');
  createGroup = this.ss.prefetch('l/create');
  idDescriptions = Object.values(Descriptions);
  typeSettings: SettingName[][] = [
    ['maxPlayers', 'hotEntry', 'publicMode'],
    ['turnTime', 'playTo', 'watchers'],
    ['cadeMaxPlayers', 'cadeHotEntry', 'cadePublicMode', 'allowGuests'],
    ['cadeMaxPlayers', 'cadeHotEntry', 'cadePublicMode', 'allowGuests'],
    ['flagMaxPlayers', 'flagHotEntry', 'flagPublicMode', 'flagAllowGuests'],
  ];

  private sub = new Subscription();

  constructor(
    public ws: WsService,
    private ss: SettingsService,
    private ref: MatDialogRef<CreateComponent>,
  ) { }

  ngOnInit(): void {
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v) return;
      this.ws.send(OutCmd.LobbyListJoin);
      void this.ss.getGroup('l/create').then(s => {
        this.settings = s;
        void this.changeType();
      });
    }));
    this.sub.add(this.ws.subscribe(InCmd.NavigateTo, () => this.ref.close()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  async createLobby(): Promise<void> {
    this.created = true;
    this.createGroup.createType = this.settings.createType ?? this.createGroup.createType;
    const group = {} as ServerSettingMap;
    // ensure createGroup is populated
    await this.changeType(false);
    Object.entries(this.createGroup).forEach(([key, value]) => {
      if (value) group[key as ServerSettingGroup[SettingGroup]] = value.toDBSetting();
    });
    this.ws.send(OutCmd.LobbyCreate, group);
  }

  async changeType(update = true): Promise<void> {
    this.createGroup = await this.ss.getGroup('l/' + groups[this.settings.createType?.value || 0] as SettingGroup, update);
  }
}
