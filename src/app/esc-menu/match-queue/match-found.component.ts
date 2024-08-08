import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatchmakingService } from './matchmaking.service';

@Component({
  selector: 'q-match-found-dialog',
  template: `
    <h1 mat-dialog-title>Match Found</h1>
    <div mat-dialog-content>
      <p>A match has been found. You have 10 seconds to accept or decline.</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="decline()">Decline</button>
      <a [href]="'/lobby/' + lobbyId" (click)="accept()">Accept</a>
    </div>
  `,
})
export class MatchFoundDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<MatchFoundDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public lobbyId: number,
    private matchmakingService: MatchmakingService,
  ) {}

  accept(): void {
    this.dialogRef.close(true);
  }

  decline(): void {
    this.dialogRef.close(false);
  }
}
