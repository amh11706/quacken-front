import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat/chat.service';
import { SettingMap, SettingsService } from '../settings/settings.service';
import { InCmd, Internal, OutCmd } from '../ws-messages';
import { WsService, InMessage } from '../ws.service';
import { LobbyWrapperComponent } from './lobby-wrapper/lobby-wrapper.component';
import { ActivatedRoute } from '@angular/router';
import { FriendsService } from '../chat/friends/friends.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { KeyActions } from '../settings/key-binding/key-actions';
import { BoatSync } from '../lobby/quacken/boats/convert';
import { EscMenuService } from '../esc-menu/esc-menu.service';

const joinMessage = 'Match replay: Use the replay controls to see a previous match from any angle.';

@Component({
  selector: 'q-replay',
  templateUrl: './replay.component.html',
  styleUrls: ['./replay.component.scss']
})
export class ReplayComponent implements OnInit, OnDestroy {
  @ViewChild(LobbyWrapperComponent, { static: true }) private lobbyWrapper?: LobbyWrapperComponent;
  tickInterval = 0;
  messages: InMessage[][] = [];
  private sub = new Subscription();
  private fakeWs: WsService = {} as any;
  private fakeChat: ChatService = {} as any;
  private graphicSettings?: SettingMap;
  private boats: BoatSync[] = [];
  private id = 0;
  tick = 0;
  seed = '';

  constructor(
    private location: Location,
    private esc: EscMenuService,
    private ws: WsService,
    private ss: SettingsService,
    private fs: FriendsService,
    private route: ActivatedRoute,
    private kbs: KeyBindingService,
  ) { }

  async ngOnInit() {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: joinMessage } });
    if (this.lobbyWrapper) {
      this.fakeChat = this.lobbyWrapper.chat;
      this.fakeWs = this.lobbyWrapper.ws;
      this.ws.fakeWs = this.fakeWs;
      this.fakeWs.user = this.ws.user;
      this.fs.fakeFs = this.lobbyWrapper.fs;
      this.fs.fakeFs.isFriend = this.fs.isFriend.bind(this.fs);
      this.fs.fakeFs.isBlocked = this.fs.isBlocked.bind(this.fs);
    }
    this.route.paramMap.subscribe(map => this.getMatch(Number(map.get('id' || 0))));
    this.sub.add(this.fakeWs.outMessages$.subscribe(m => {
      if (m.cmd === OutCmd.Sync) this.sendSync();
    }));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (v) this.ws.send(OutCmd.BnavJoin);
    }));

    this.sub.add(this.kbs.subscribe(KeyActions.Play, v => {
      if (v) this.togglePlay();
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.NextTurn, v => {
      if (v) this.nextTurn();
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.PrevTurn, v => {
      if (v) this.prevTurn();
    }));
  }

  ngOnDestroy() {
    delete this.ws.fakeWs;
    delete this.fs.fakeFs;
    this.sub.unsubscribe();
  }

  private async getMatch(id: number) {
    this.tick = 0;
    this.id = id;
    clearInterval(this.tickInterval);
    this.tickInterval = 0;
    const match = await this.ws.request(OutCmd.MatchData, +id);
    if (!match) return;
    this.messages = match.data.messages;
    this.seed = match.data.seed;

    const settings = match.data.settings;
    for (const group in settings) {
      if (!settings.hasOwnProperty(group)) continue;
      const settingGroup = settings[group];
      if (!this.graphicSettings) {
        this.graphicSettings = settingGroup;
        if (!settings[group].turnTime.value) settingGroup.turnTime.value = 10;
      }
      this.ss.setFakeSettings(group, settingGroup);
    }

    setTimeout(() => {
      this.fakeMessages();
      const join = this.messages[0][0];
      join.cmd = InCmd.Turn;
      const firstSync = { cmd: InCmd.Sync, data: { sync: Object.values(join.data?.boats), flags: join.data.flags } };
      this.messages[0].push(firstSync);
      this.checkMessage(firstSync);
      setTimeout(() => {
        this.esc.open = false;
      });
      setTimeout(() => { // temporary fix for starting replay
        this.playTo(Number(this.route.snapshot.queryParams['tick']));
      }, 500);
    });
  }

  private sendSync() {
    this.fakeWs.dispatchMessage({ cmd: InCmd.Sync, data: { sync: this.boats } });
  }

  private checkMessage(m: InMessage) {
    switch (m.cmd) {
      case InCmd.Sync:
        this.boats = [...m.data.sync];
        break;
      case InCmd.NewBoat:
        this.boats = this.boats.filter(b => b.id !== m.data.id);
        this.boats.push(m.data);
        break;
      case InCmd.DelBoat:
        this.boats = this.boats.filter(b => b.id !== m.data);
        break;
      default:
    }
  }

  pause() {
    clearInterval(this.tickInterval);
    this.tickInterval = 0;
  }

  togglePlay() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = 0;
      return;
    }

    if (this.tick + 1 === this.messages.length) {
      this.playTo(0);
    }
    this.tickInterval = window.setInterval(() => {
      if (this.tick + 1 === this.messages.length) return this.togglePlay();
      this.tick++;
      this.fakeMessages();
    }, (this.graphicSettings?.turnTime.value || 10) * 1000 / 30);
  }

  nextTurn() {
    if (this.tickInterval) {
      this.togglePlay();
      this.togglePlay();
    }
    // setTimeout(() => this.fakeWs.dispatchMessage({ cmd: Internal.CenterOnBoat }));
    for (let target = this.tick + 3; target < this.messages.length; target++) {
      if (this.messages[target].find(el => el.cmd === InCmd.Turn)) {
        this.playTo(target - 2);
        return;
      }
    }
    this.playTo(this.messages.length - 1);
  }

  prevTurn() {
    if (this.tickInterval) {
      this.togglePlay();
      this.togglePlay();
    }
    // setTimeout(() => this.fakeWs.dispatchMessage({ cmd: Internal.CenterOnBoat }));
    for (let target = this.tick - 1; target > 0; target--) {
      if (this.messages[target].find(el => el.cmd === InCmd.Turn)) {
        this.playTo(target - 2);
        return;
      }
    }
    this.playTo(1);
  }

  playTo(value: number) {
    if (value === this.tick) return;

    if (value < this.tick) {
      for (let i = this.tick; i >= 0; i--) {
        let syncFound = false;
        for (let i2 = this.messages[i].length - 1; i2 >= 0; i2--) {
          const m = this.messages[i][i2];
          if (m.cmd === InCmd.Sync) syncFound = true;
          else if (m.data === this.fakeChat.messages[this.fakeChat.messages.length - 1]) this.fakeChat.messages.pop();
        }

        if (i > value || !syncFound) continue;
        this.tick = i;
        this.fakeWs.dispatchMessage({ cmd: Internal.ResetBoats });
        this.fakeMessages(true);
        break;
      }
      this.fakeWs.dispatchMessage({ cmd: Internal.RefreshChat });
    } else this.sendSync();

    while (value > this.tick) {
      this.tick++;
      this.fakeMessages(true);
    }
    this.location.replaceState('/replay/' + this.id + '?tick=' + this.tick);
  }

  private fakeMessages(skipTurn = false) {
    for (const m of this.messages[this.tick]) {
      this.checkMessage(m);
      if (m.cmd !== InCmd.Sync) {
        this.fakeWs.dispatchMessage(m);
        continue;
      }
      if (!skipTurn) continue;

      this.fakeWs.dispatchMessage({ cmd: Internal.ResetBoats });
      this.fakeWs.dispatchMessage(m);
    }
  }

}
