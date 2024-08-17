import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchFoundDialogComponent } from './match-found.component';
import { WsService } from '../../ws/ws.service';
import { InCmd } from '../../ws/ws-messages';

@Injectable({
  providedIn: 'root',
})
export class MatchmakingService {
  inQueue = false;

  constructor(
    private ws: WsService,
    private dialog: MatDialog,
  ) {
    this.ws.connected$.subscribe(() => {
      this.inQueue = false;
    });

    this.ws.subscribe(InCmd.QueueMatch, id => {
      this.openMatchFoundDialog(id);
    });
  }

  private openMatchFoundDialog(lobbyId: number): void {
    this.inQueue = false;
    const dialogRef = this.dialog.open(MatchFoundDialogComponent, {
      width: '300px',
      disableClose: true,
      data: lobbyId,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.inQueue = false;
    });
  }
}
