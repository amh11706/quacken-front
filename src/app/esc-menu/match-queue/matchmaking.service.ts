import { Injectable, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class MatchmakingService {
  constructor(private dialog: MatDialog) {
    this.initializeTimeout();
  }

  private initializeTimeout(): void {
    const timeoutDuration = 10000; // Timeout duration in milliseconds (10 seconds)
    setTimeout(() => {
      this.onTimeout();
    }, timeoutDuration);
  }

  private onTimeout(): void {
    console.log('Timeout occurred');
    this.openMatchFoundDialog();
  }

  private openMatchFoundDialog(): void {
    const dialogRef = this.dialog.open(MatchFoundDialogComponent, {
      width: '300px',
      disableClose: true, // Prevent closing the dialog by clicking outside
    });

    const autoCloseTimeout = 10000; // 10 seconds

    // Set a timeout to auto close the dialog after 10 seconds
    const timer = setTimeout(() => {
      dialogRef.close(false);
    }, autoCloseTimeout);

    dialogRef.afterClosed().subscribe(result => {
      clearTimeout(timer); // Clear the timer if the dialog was closed manually
      if (result) {
        console.log('Match accepted');
        // Add logic for when the match is accepted
      } else {
        console.log('Match declined');
        // Add logic for when the match is declined or auto-closed
      }
    });
  }
}

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
  `,
})
export class MatchFoundDialogComponent {
  constructor(private dialogRef: MatDialogRef<MatchFoundDialogComponent>
    , @Inject(MAT_DIALOG_DATA) public lobbyId: number,
  ) {}

  accept(): void {
    this.dialogRef.close(true);
  }

  decline(): void {
    this.dialogRef.close(false);
  }
}
