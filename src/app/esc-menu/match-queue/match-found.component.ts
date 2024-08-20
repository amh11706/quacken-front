import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Sounds, SoundService } from '../../sound.service';

@Component({
  standalone: true,
  selector: 'q-match-found-dialog',
  imports: [MatButtonModule, MatDialogModule, CommonModule],
  template: `
    <h1 mat-dialog-title>{{data.rated ? 'Rated' : 'Unrated'}} Match Found</h1>
    <div mat-dialog-content>
      <p *ngIf="!expired; else expiredMessage">Time left to accept: {{ timeLeft | async }} seconds</p>
      <ng-template #expiredMessage>
        <p>You had a match, but it expired so you have been removed from the queue.</p>
      </ng-template>
    </div>
    <div mat-dialog-actions>
      <button *ngIf="expired; else options" mat-button (click)="decline()">Close</button>
      <ng-template #options>
        <a mat-raised-button [color]="'primary'"
           target="_blank" [href]="'/#/lobby/' + data.lobbyId" (click)="accept()">Accept</a>
        <button mat-raised-button [color]="'warn'" (click)="decline()">Decline</button>
      </ng-template>
    </div>
  `,
})
export class MatchFoundDialogComponent implements OnInit {
  openTime = Date.now();
  timeLeft = new Subject<number>();
  private timer = 0;
  expired = false;

  constructor(
    private dialogRef: MatDialogRef<MatchFoundDialogComponent>,
    private sound: SoundService,
    @Inject(MAT_DIALOG_DATA) public data: {lobbyId: number, rated: boolean},
  ) { }

  ngOnInit() {
    void this.sound.play(Sounds.BattleStart);

    setTimeout(() => {
      this.expired = true;
    }, 10000);

    this.timeLeft.next(10);
    this.timer = window.setInterval(() => {
      if (this.expired) {
        return;
      }
      const timeLeft = 10 - Math.floor((Date.now() - this.openTime) / 1000);
      this.timeLeft.next(timeLeft);
      if (timeLeft <= 0) {
        this.expired = true;
      }
    }, 1000);
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
