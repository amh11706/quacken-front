/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
import { ServerSettingGroup } from '../../settings/setting/settings';
import { ServerSettingMap } from '../../settings/types';
import { NotificationService } from './notification.service';
import { LobbyType, LobbyTypes } from '../../lobby/cadegoose/lobby-type';

const QueueTypes = [
  LobbyTypes[LobbyType.CadeGoose],
  LobbyTypes[LobbyType.BA],
]

@Component({
  selector: 'q-match-queue',
  standalone: true,
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
  styleUrls: ['./match-queue.component.scss'],
})
export class MatchQueueComponent implements OnInit {
  queueLength = new Subject<number>();
  pending = new BehaviorSubject<boolean>(false);
  isGuest = this.ws.user.id === 0;
  private subscriptions: Subscription[] = [];
  matchSettings = this.ss.prefetch('matchmaking');
  queueTypes = QueueTypes;

  constructor(
    public ws: WsService,
    private ss: SettingsService,
    public ms: MatchmakingService,
    private router: Router,
    private ns: NotificationService,
  ) { }

  ngOnInit() {
    void this.ss.getGroup('matchmaking').then(() => {
      if (this.isGuest) this.matchSettings.rated.value = 0;
    });
    // Subscribe to settings value changes using SettingsService
    this.subscriptions.push(
      this.matchSettings.minTurnTime.userStream.subscribe((value) => {
        if (value > this.matchSettings.maxTurnTime.value) {
          this.matchSettings.maxTurnTime.value = (value);
        }
      }));

    this.subscriptions.push(
      this.matchSettings.maxTurnTime.userStream.subscribe((value) => {
        if (value < this.matchSettings.minTurnTime.value) {
          this.matchSettings.minTurnTime.value = (value);
        }
      }));

    this.subscriptions.push(
      this.ws.connected$.subscribe(value => {
        if (value) {
          this.ws.send(OutCmd.WatchQueue);
        }
      }));

    this.subscriptions.push(
      this.ws.subscribe(InCmd.QueueLength, length => {
        this.queueLength.next(length);
      }));
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.ws.send(OutCmd.UnwatchQueue);
  }

  private async formatSettings(): Promise<ServerSettingMap<'matchmaking'>> {
    // make sure we wait for the real settings, not the prefilled defaults
    const matchSettings = await this.ss.getGroup('matchmaking');
    const settings = {} as ServerSettingMap<'matchmaking'>;
    for (const [name, setting] of Object.entries(matchSettings)) {
      settings[name as ServerSettingGroup['matchmaking']] = setting.toDBSetting<'matchmaking'>();
    }
    return settings;
  }

  async joinQueue(): Promise<void> {
    this.pending.next(true);
    const res = await this.ws.request(OutCmd.JoinQueue, await this.formatSettings());
    this.pending.next(false);
    if (res) {
      void this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: res } as any });
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
    this.ns.test();
  }
}
