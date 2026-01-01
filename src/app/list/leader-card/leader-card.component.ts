import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { RankLeader } from '../../esc-menu/profile/types';
import { NameModule } from '../../chat/name/name.module';
import { StatService } from '../../esc-menu/profile/stat.service';
import { ActiveLobbyTypes, RankArea } from '../../lobby/cadegoose/lobby-type';

export interface Top3Area {
  top3: RankLeader[];
  area: RankArea;
  title: string;
}

@Component({
  selector: 'q-leader-card',
  imports: [NameModule, CommonModule],
  templateUrl: './leader-card.component.html',
  styleUrl: './leader-card.component.scss',
})
export class LeaderCardComponent implements OnInit, OnDestroy {
  private ws = inject(WsService);
  private stat = inject(StatService);

  private timer = 0;
  private top3: Top3Area[] = [];
  private index = 0;
  displayedLeaders = new BehaviorSubject<Top3Area>({ area: RankArea.BoardAdmiral } as Top3Area);

  ngOnInit() {
    void this.getTop3();
    this.startTimer();
    document.addEventListener('visibilitychange', this.visibilityChange);
  }

  ngOnDestroy() {
    this.stopTimer();
    document.removeEventListener('visibilitychange', this.visibilityChange);
  }

  openLeaders(area: RankArea = this.displayedLeaders.value.area): void {
    void this.stat.openLeaders(area * 100 - 1);
  }

  visibilityChange = () => {
    if (document.hidden) {
      this.stopTimer();
    } else {
      void this.getTop3().then(this.startTimer);
    }
  };

  startTimer = () => {
    this.stopTimer();
    this.timer = window.setInterval(() => this.advance(), 10000);
  };

  stopTimer = () => {
    clearInterval(this.timer);
  };

  private async getTop3() {
    this.top3 = await this.ws.request(OutCmd.RanksTop3) || [];
    for (const leaders of this.top3) {
      leaders.title = (ActiveLobbyTypes.find(l => l.id === leaders.area)?.name || '') +
        leaders.title;
      for (const leader of leaders.top3) {
        StatService.formatLeader(leader);
      }
    }
    this.index = 0;
    const leaders = this.top3[this.index];
    if (leaders) this.displayedLeaders.next(leaders);
  }

  private advance() {
    this.index = (this.index + 1);
    const leaders = this.top3[this.index];
    if (!leaders) {
      void this.getTop3();
      return;
    }
    this.displayedLeaders.next(leaders);
  }
}
