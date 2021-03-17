import { Component, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Subscription } from 'rxjs';
import { ChatService } from '../chat/chat.service';
import { BoatSync } from '../lobby/quacken/boats/boats.component';
import { SettingMap, SettingsService } from '../settings/settings.service';
import { InCmd, Internal, OutCmd } from '../ws-messages';
import { WsService, Message } from '../ws.service';

@Component({
  selector: 'q-replay',
  templateUrl: './replay.component.html',
  styleUrls: ['./replay.component.scss']
})
export class ReplayComponent implements OnInit {
  tickInterval = 0;
  messages: Message[][] = [];
  private sub = new Subscription();

  private graphicSettings?: SettingMap;
  // TODO: keep this boat list up to date as the turn slider goes.
  private boats: BoatSync[] = [];
  tick = 0;

  constructor(
    private ws: WsService,
    private ss: SettingsService,
    private chat: ChatService,
  ) { }

  ngOnInit(): void {
    const data = localStorage.getItem('matchData');
    if (!data) return;
    const parsed = JSON.parse(data);
    this.messages = parsed.data.messages;

    const settings = parsed.data.settings;
    for (const group in settings) {
      if (!settings.hasOwnProperty(group)) continue;
      const settingGroup = settings[group];
      if (!this.graphicSettings) {
        this.graphicSettings = settingGroup;
        if (!settings[group].turnTime.value) settingGroup.turnTime.value = 10;
      }
      this.ss.setFakeSettings(group, settingGroup);
    }

    this.sub.add(this.ws.outMessages$.subscribe(m => {
      if (m.cmd === OutCmd.Sync) this.sendSync();
    }));

    setTimeout(() => {
      this.fakeMessages();
      const join = this.messages[0][0];
      const firstSync = { cmd: InCmd.Sync, data: { sync: Object.values(join.data?.boats) } };
      this.messages[0][0] = firstSync;
      this.checkMessage(firstSync);
    });
  }

  private sendSync() {
    this.ws.dispatchMessage({ cmd: InCmd.Sync, data: { sync: this.boats } });
  }

  private checkMessage(m: Message) {
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
          else if (m.data === this.chat.messages[this.chat.messages.length - 1]) this.chat.messages.pop();
        }

        if (i > value || !syncFound) continue;
        this.tick = i;
        this.ws.dispatchMessage({ cmd: Internal.ResetBoats });
        this.fakeMessages(true);
        break;
      }
      this.ws.dispatchMessage({ cmd: Internal.RefreshChat });
    } else this.sendSync();

    while (value > this.tick) {
      this.tick++;
      this.fakeMessages(true);
    }
  }

  private fakeMessages(skipTurn = false) {
    for (const m of this.messages[this.tick]) {
      this.checkMessage(m);
      if (m.cmd !== InCmd.Sync) {
        this.ws.dispatchMessage(m);
        continue;
      }
      if (!skipTurn) continue;

      this.ws.dispatchMessage({ cmd: Internal.ResetBoats });
      this.ws.dispatchMessage(m);
    }
  }

}
