import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { SettingsService } from '../settings/settings.service';
import { InCmd, Internal, OutCmd } from '../ws/ws-messages';
import { WsService } from '../ws/ws.service';
import { FriendsService } from '../chat/friends/friends.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { KeyActions } from '../settings/key-binding/key-actions';
import { EscMenuService } from '../esc-menu/esc-menu.service';
import { BoatSync } from '../lobby/quacken/boats/types';
import { ServerSettingMap } from '../settings/types';
import { InMessage } from '../ws/ws-subscribe-types';
import { CadeLobby } from '../lobby/cadegoose/types';
import { SettingGroup } from '../settings/setting/settings';
import { BoatRender3d } from '../lobby/cadegoose/boat-render';
import { LobbyWrapperService } from './lobby-wrapper/lobby-wrapper.service';

const joinMessage = 'Match replay: Use the replay controls to see a previous match from any angle.';

@Component({
  selector: 'q-replay',
  templateUrl: './replay.component.html',
  styleUrls: ['./replay.component.scss'],
})
export class ReplayComponent implements OnInit, OnDestroy {
  set animationPlayState(v: string) {
    this.el.nativeElement.style.setProperty('--playState', v);
  }

  tickInterval = 0;
  messages: InMessage[][] = [];
  private sub = new Subscription();
  private fakeWs: WsService = {} as any;
  private fakeChat: ChatService = {} as any;
  graphicSettings?: ServerSettingMap<'l/cade'>;
  private boats: BoatSync[] = [];
  private id = 0;
  tick = 0;
  seed = '';
  private lobbyMessage?: { cmd: InCmd.LobbyJoin, data: CadeLobby };
  private lastSync: InMessage = { cmd: InCmd.Sync, data: { sync: [], cSync: [], turn: 0 } };

  constructor(
    private location: Location,
    public esc: EscMenuService,
    protected ws: WsService,
    private ss: SettingsService,
    private fs: FriendsService,
    private route: ActivatedRoute,
    private kbs: KeyBindingService,
    private el: ElementRef,
    private wrapper: LobbyWrapperService,
  ) { }

  ngOnInit(): void {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: joinMessage, from: '' } });
    this.fakeChat = this.wrapper.chat ?? this.fakeChat;
    this.fakeWs = this.wrapper.ws ?? this.fakeWs;
    this.fakeWs.user = this.ws.user;
    if (this.wrapper.fs) {
      this.wrapper.fs.isFriend = this.fs.isFriend.bind(this.fs);
      this.wrapper.fs.isBlocked = this.fs.isBlocked.bind(this.fs);
    }
    this.sub.add(this.fakeWs.outMessages$.subscribe(m => {
      if (m.cmd === OutCmd.Sync) this.sendSync();
    }));

    this.route.paramMap.subscribe(map => this.getMatch(Number(map.get('id'))));
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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  protected async getMatch(id: number): Promise<void> {
    this.tick = 0;
    this.id = id;
    clearInterval(this.tickInterval);
    this.tickInterval = 0;
    const match = await this.ws.request(OutCmd.MatchData, +id);
    if (!match?.data) return;
    this.messages = match.data.messages;
    this.seed = match.data.seed;

    const settings = match.data.settings;
    for (const [group, setting] of Object.entries(settings)) {
      if (!settings.hasOwnProperty(group)) continue;
      if (!this.graphicSettings) {
        this.graphicSettings = setting as ServerSettingMap<'l/cade'>;
      }
      // setting.turnTime = { id: 0, name: 'turnTime', group: group as SettingGroup, value: 10 };
      this.ss.setSettings(group as SettingGroup, setting);
    }

    setTimeout(() => {
      this.fakeMessages();
      this.ss.admin$.next(true);
      const m = this.messages[0]?.shift();
      if (m?.cmd === InCmd.LobbyJoin) this.lobbyMessage = m as any;
      if (!this.lobbyMessage) return;
      this.lastSync = {
        cmd: InCmd.Sync,
        data: { sync: Object.values(this.lobbyMessage.data?.boats || {}), cSync: [], turn: 0 },
      };
      this.messages[0]?.push(this.lastSync);
      this.checkMessage(this.lastSync);
      setTimeout(() => {
        void this.esc.openMenu(false);
      }, 1000);
      setTimeout(() => { // temporary fix for starting replay
        this.playTo(Number(this.route.snapshot.queryParams.tick));
      }, 500);
    });
  }

  private sendSync() {
    this.fakeWs.dispatchMessage(this.lastSync);
  }

  private addBoat(b: BoatSync | BoatSync[]): void {
    if (Array.isArray(b)) {
      const boatMap = new Set(b.map(b2 => b2.id));
      this.boats = this.boats.filter(b2 => !boatMap.has(b2.id));
      this.boats.push(...b);
      return;
    }
    this.boats = this.boats.filter(b2 => b2.id !== b.id);
    this.boats.push(b);
  }

  protected checkMessage(m: InMessage): void {
    switch (m.cmd) {
      case InCmd.Sync:
        this.boats = [...m.data.sync];
        this.lastSync = m;
        break;
      case InCmd.NewBoat:
        this.addBoat(m.data);
        break;
      case InCmd.DelBoat:
        this.boats = this.boats.filter(b => b.id !== m.data);
        break;
      default:
    }
  }

  pause(): void {
    clearInterval(this.tickInterval);
    this.tickInterval = 0;
  }

  togglePlay(): void {
    BoatRender3d.paused = !!this.tickInterval;
    if (this.tickInterval) {
      this.animationPlayState = 'paused';
      clearInterval(this.tickInterval);
      this.tickInterval = 0;
      return;
    }

    this.animationPlayState = 'running';
    this.tickInterval = window.setInterval(() => {
      if (this.tick + 1 === this.messages.length) return;
      if (this.tick % 30 === 28) this.location.replaceState('/replay/' + this.id + '?tick=' + this.tick);
      this.tick++;
      this.fakeMessages();
    }, (this.graphicSettings?.turnTime?.value || 10) * 1000 / 30);
  }

  nextTurn(): void {
    if (this.tickInterval) {
      this.togglePlay();
      BoatRender3d.tweens.update(Infinity);
      BoatRender3d.tweens.removeAll();
      this.togglePlay();
    }
    // setTimeout(() => this.fakeWs.dispatchMessage({ cmd: Internal.CenterOnBoat }));
    for (let target = this.tick + 3; target < this.messages.length; target++) {
      if (this.messages[target]?.find(el => el.cmd === InCmd.Turn)) {
        this.playTo(target - 2);
        return;
      }
    }
    this.playTo(this.messages.length - 1);
  }

  prevTurn(): void {
    if (this.tickInterval) {
      this.togglePlay();
      this.togglePlay();
    }
    // setTimeout(() => this.fakeWs.dispatchMessage({ cmd: Internal.CenterOnBoat }));
    for (let target = this.tick - 1; target > 0; target--) {
      if (this.messages[target]?.find(el => el.cmd === InCmd.Turn)) {
        this.playTo(target - 2);
        return;
      }
    }
    this.playTo(1);
  }

  playTo(value: number): void {
    if (value === this.tick) return;

    if (value < this.tick) {
      for (let i = this.tick; i >= 0; i--) {
        let syncFound = false;
        for (let i2 = (this.messages[i]?.length || 0) - 1; i2 >= 0; i2--) {
          const m = this.messages[i]?.[i2];
          if (m?.cmd === InCmd.Sync) syncFound = true;
          else if (m?.data === this.fakeChat.messages[this.fakeChat.messages.length - 1]) this.fakeChat.messages.pop();
        }

        if (i > value || !syncFound) continue;
        this.tick = i;
        this.fakeWs.dispatchMessage({ cmd: Internal.ResetBoats, data: undefined });
        this.fakeMessages(true);
        break;
      }
      if (this.lobbyMessage?.data.map) {
        // reset the map because it could have changed in capture the flag mode
        this.fakeWs.dispatchMessage({ cmd: Internal.SetMap, data: this.lobbyMessage.data.map });
      }
    } else this.sendSync();

    while (value > this.tick) {
      this.tick++;
      this.fakeMessages(true);
    }
    this.location.replaceState('/replay/' + this.id + '?tick=' + this.tick);
  }

  private fakeMessages(skipTurn = false) {
    const messages = this.messages[this.tick];
    if (!messages) return;
    for (const m of messages) {
      this.checkMessage(m);
      if (m.cmd !== InCmd.Sync) {
        this.fakeWs.dispatchMessage?.(m);
        continue;
      }
      if (!skipTurn) continue;

      this.fakeWs.dispatchMessage?.({ cmd: Internal.ResetBoats, data: undefined });
      this.fakeWs.dispatchMessage?.(m);
    }
  }
}
