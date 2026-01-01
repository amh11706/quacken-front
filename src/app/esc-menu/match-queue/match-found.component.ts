import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Sounds, SoundService } from '../../sound.service';
import { ActiveLobbyTypes } from '../../lobby/cadegoose/lobby-type';
import { SubscribeData } from '../../ws/ws-subscribe-types';
import { InCmd } from '../../ws/ws-messages';

const TimeLimit = 20;

@Component({
  selector: 'q-match-found-dialog',
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  template: `
    <h1 mat-dialog-title>{{data.rated ? 'Rated' : 'Unrated'}} {{areaName}} Match Found</h1>
    <div mat-dialog-content>
      @if (!expired) {
        <p>Time left to accept: {{ timeLeft | async }} seconds</p>
      } @else {
        <p>You had a match, but it expired so you have been removed from the queue.</p>
      }
    </div>
    <div mat-dialog-actions>
      @if (expired) {
        <button mat-button (click)="decline()">Close</button>
      } @else {
        <a mat-raised-button [color]="'primary'"
        target="_blank" [href]="'/#/lobby/' + data.lobbyId" (click)="accept()">Accept</a>
        <button mat-raised-button [color]="'warn'" (click)="decline()">Decline</button>
      }
    </div>
    `,
})
export class MatchFoundDialogComponent implements OnInit {
  private dialogRef = inject<MatDialogRef<MatchFoundDialogComponent>>(MatDialogRef);
  private sound = inject(SoundService);
  data = inject(MAT_DIALOG_DATA);

  openTime = Date.now();
  timeLeft = new Subject<number>();
  private timer = 0;
  expired = false;
  areaName?: string;

  ngOnInit() {
    void this.sound.play(Sounds.BattleStart);
    this.areaName = ActiveLobbyTypes.find(l => l.id === this.data.area)?.name;

    setTimeout(() => {
      this.expired = true;
    }, TimeLimit * 1000);

    this.timeLeft.next(10);
    this.timer = window.setInterval(() => {
      if (this.expired) {
        return;
      }
      const timeLeft = TimeLimit - Math.floor((Date.now() - this.openTime) / 1000);
      this.timeLeft.next(timeLeft);
      if (timeLeft <= 0) {
        this.expired = true;
      }
    }, 1000);
    this.timeLeft.next(TimeLimit);
  }

  accept(): void {
    this.dialogRef.close(true);
    clearInterval(this.timer);
  }

  decline(): void {
    this.dialogRef.close(false);
    clearInterval(this.timer);
  }
}
