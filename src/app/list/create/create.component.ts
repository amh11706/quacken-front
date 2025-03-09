import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { SettingsService } from '../../settings/settings.service';
import { ServerSettingGroup, SettingGroup, SettingName } from '../../settings/setting/settings';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { ServerSettingMap } from '../../settings/types';
import { LobbyTypes, RankArea, LobbyTypeInfo, ActiveLobbyTypes } from '../../lobby/cadegoose/lobby-type';

@Component({
  selector: 'q-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CreateComponent implements OnInit, OnDestroy {
  created = false;
  settings = this.ss.prefetch('l/create');
  createGroup = this.ss.prefetch('l/create');
  lobbyTypes = LobbyTypes;
  typeSettings: Record<RankArea, SettingName[]> = [
    ['maxPlayers', 'hotEntry', 'publicMode'],
    ['turnTime', 'playTo', 'watchers'],
    ['cadeMaxPlayers', 'cadeHotEntry', 'cadePublicMode', 'allowGuests'],
    ['cadeMaxPlayers', 'cadeHotEntry', 'cadePublicMode', 'allowGuests'],
    ['flagMaxPlayers', 'flagHotEntry', 'flagPublicMode', 'flagAllowGuests'],
    ['cadeMaxPlayers', 'cadeHotEntry', 'cadePublicMode', 'allowGuests'],
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

  get lobbyType(): LobbyTypeInfo {
    const lobby = ActiveLobbyTypes.find(l => l.id === this.settings.createType?.value as RankArea) ??
      ActiveLobbyTypes[0]!;
    this.settings.createType.setServerValue(lobby.id);
    return lobby;
  }

  async createLobby(): Promise<void> {
    this.created = true;
    this.createGroup.createType = this.settings.createType;
    const group = {} as ServerSettingMap;
    // ensure createGroup is populated
    await this.changeType(false);
    Object.entries(this.createGroup).forEach(([key, value]) => {
      if (value) group[key as ServerSettingGroup[SettingGroup]] = value.toDBSetting();
    });
    this.ws.send(OutCmd.LobbyCreate, group);
  }

  async changeType(update = true): Promise<void> {
    this.createGroup = await this.ss.getGroup(this.lobbyType.sGroup, update);
  }
}
