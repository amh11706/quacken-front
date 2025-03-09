import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { SettingsService } from '../../settings/settings.service';
import { WsService } from '../../ws/ws.service';
import { SettingsModule } from '../../settings/settings.module';
import { MatchmakingService } from './matchmaking.service';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { NotificationService } from './notification.service';
import { RankArea } from '../../lobby/cadegoose/lobby-type';
import { OutCmdInputTypes } from '../../ws/ws-request-types';
import { Setting } from '../../settings/types';
import { InMessage } from '../../ws/ws-subscribe-types';

@Component({
  selector: 'q-match-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    CommonModule,
    SettingsModule,
    MatCardModule,
    MatTooltipModule,
    MatExpansionModule,
    LetDirective,
  ],
  templateUrl: './match-queue.component.html',
  styleUrl: './match-queue.component.scss',
})
export class MatchQueueComponent implements OnInit, OnDestroy {
  queueLength = new Subject<number>();
  pending = new BehaviorSubject<boolean>(false);
  isGuest = this.ws.user.id === 0;
  private subs: Subscription[] = [];
  matchSettings = this.ss.prefetch('matchmaking');

  constructor(
    public ws: WsService,
    private ss: SettingsService,
    public ms: MatchmakingService,
    private router: Router,
    private ns: NotificationService,
  ) { }

  ngOnInit() {
    void this.ss.getGroup('matchmaking').then(() => {
      this.updateSettings();
      if (this.isGuest) this.matchSettings.rated.value = 0;
    });
    // Subscribe to settings value changes using SettingsService
    this.subs.push(this.matchSettings.minTurnTime.userStream.subscribe(value => {
      if (value > this.matchSettings.maxTurnTime.value) {
        this.matchSettings.maxTurnTime.value = value;
      }
      this.setSettingData(this.matchSettings.minTurnTime, value);
    }));

    this.subs.push(this.matchSettings.maxTurnTime.userStream.subscribe(value => {
      if (value < this.matchSettings.minTurnTime.value) {
        this.matchSettings.minTurnTime.value = value;
      }
      this.setSettingData(this.matchSettings.maxTurnTime, value);
    }));

    this.subs.push(this.matchSettings.deltaRank.userStream.subscribe(value => {
      this.setSettingData(this.matchSettings.deltaRank, value);
    }));

    this.subs.push(this.matchSettings.rated.userStream.subscribe(value => {
      this.setSettingData(this.matchSettings.rated, value);
    }));

    this.subs.push(this.matchSettings.lobbyType.userStream.subscribe(() => {
      this.updateSettings();
    }));

    this.subs.push(this.ws.connected$.subscribe(value => {
      if (value) this.ws.send(OutCmd.WatchQueue);
    }));

    this.subs.push(this.ws.subscribe(InCmd.QueueLength, length => {
      this.queueLength.next(length);
    }));
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subs.forEach(sub => sub.unsubscribe());
    this.ws.send(OutCmd.UnwatchQueue);
  }

  private updateSettings() {
    this.syncSettingData(this.matchSettings.minTurnTime);
    this.syncSettingData(this.matchSettings.maxTurnTime);
    this.syncSettingData(this.matchSettings.deltaRank);
    this.syncSettingData(this.matchSettings.rated);
  }

  get lobbyType(): RankArea {
    return this.matchSettings.lobbyType.value;
  }

  private setSettingData(setting: Setting, value: number): void {
    if (!setting.data || typeof setting.data !== 'object') setting.data = {};
    setting.data[this.lobbyType] = value;
  }

  private syncSettingData(setting: Setting) {
    const lobbySetting = setting.data?.[this.lobbyType];
    setting.setServerValue(typeof lobbySetting === 'number' ? lobbySetting : setting.value);
  }

  private async formatSettings(): Promise<OutCmdInputTypes[OutCmd.JoinQueue]> {
    // make sure we wait for the real settings, not the prefilled defaults
    const matchSettings = await this.ss.getGroup('matchmaking');
    const settings = {} as OutCmdInputTypes[OutCmd.JoinQueue];
    const t = this.lobbyType;
    for (const [name, setting] of Object.entries(matchSettings)) {
      const value = setting.data?.[t];
      settings[name as keyof typeof settings] = typeof value === 'number' ? value : setting.value;
    }
    return settings;
  }

  async joinQueue(): Promise<void> {
    this.pending.next(true);
    const res = await this.ws.request(OutCmd.JoinQueue, await this.formatSettings());
    this.pending.next(false);
    if (res) {
      void this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: res } } as InMessage);
      return;
    }
    this.ms.inQueue = true;
    void this.ns.getPermission();
  }

  leaveQueue(): void {
    this.ws.send(OutCmd.LeaveQueue);
    this.ms.inQueue = false;
  }

  async getBotMatch(): Promise<boolean> {
    this.pending.next(true);
    const id = await this.ws.request(OutCmd.GetBotMatch, await this.formatSettings());
    this.pending.next(false);
    if (id) {
      return this.router.navigate(['/lobby', id]);
    }
    return false;
  }

  testNotification(): void {
    void this.ns.test();
  }
}
