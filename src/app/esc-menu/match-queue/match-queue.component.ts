/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsService } from '../../settings/settings.service';
import { WsService } from '../../ws/ws.service';
import { SettingsModule } from '../../settings/settings.module';
import { MatchmakingService } from './matchmaking.service';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { ServerSettingGroup } from '../../settings/setting/settings';
import { ServerSettingMap } from '../../settings/types';

@Component({
  selector: 'q-match-queue',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule, CommonModule, MatSliderModule, FormsModule, SettingsModule, MatCardModule, MatTooltipModule,
  ],
  templateUrl: './match-queue.component.html',
  styleUrls: ['./match-queue.component.scss'],
})
export class MatchQueueComponent implements OnInit {
  queueLength = new Subject<number>();
  pending = new BehaviorSubject<boolean>(false);
  isGuest = this.ws.user.id === 0;
  private subscriptions: Subscription[] = [];
  private matchSettings = this.ss.prefetch('matchmaking');

  constructor(
    public ws: WsService,
    private ss: SettingsService,
    public ms: MatchmakingService,
  ) {
  }

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

  async joinQueue(): Promise<void> {
    const settings = {} as ServerSettingMap<'matchmaking'>;
    for (const [name, setting] of Object.entries(this.matchSettings)) {
      settings[name as ServerSettingGroup['matchmaking']] = setting.toDBSetting<'matchmaking'>();
    }
    this.pending.next(true);
    const res = await this.ws.request(OutCmd.JoinQueue, settings);
    this.pending.next(false);
    if (res) {
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: res } as any });
      return;
    }
    this.ms.inQueue = true;
  }

  leaveQueue(): void {
    this.ws.send(OutCmd.LeaveQueue);
    this.ms.inQueue = false;
  }
}
