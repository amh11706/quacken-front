import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { Variations } from '../../chat/rank-circle/rank-circle.component';
import { RankLeader } from '../../esc-menu/profile/types';
import { NameModule } from '../../chat/name/name.module';
import { StatService } from '../../esc-menu/profile/stat.service';

const Titles = Variations[1] || [];

@Component({
  selector: 'q-leader-card',
  standalone: true,
  imports: [NameModule, CommonModule],
  templateUrl: './leader-card.component.html',
  styleUrl: './leader-card.component.scss',
})
export class LeaderCardComponent implements OnInit, OnDestroy {
  private timer = 0;
  private top3: RankLeader[][] = [];
  private index = 0;
  displayedLeaders = new BehaviorSubject<RankLeader[]>([]);
  displayVariation = Titles[0];

  constructor(private ws: WsService) { }

  ngOnInit() {
    void this.getTop3();
    this.startTimer();
    document.addEventListener('visibilitychange', this.visibilityChange);
  }

  ngOnDestroy() {
    this.stopTimer();
    document.removeEventListener('visibilitychange', this.visibilityChange);
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
    this.top3 = await this.ws.request(OutCmd.RanksTop3, 2) || [];
    for (const leaders of this.top3) {
      for (const leader of leaders) {
        StatService.formatLeader(leader);
      }
    }

    this.index = 0;
    this.displayedLeaders.next(this.top3[this.index] || []);
    this.displayVariation = Titles[this.index];
  }

  private advance() {
    this.index = (this.index + 1);
    if (this.index >= this.top3.length) {
      void this.getTop3();
      return;
    }
    this.displayedLeaders.next(this.top3[this.index] || []);
    this.displayVariation = Titles[this.index];
  }
}
