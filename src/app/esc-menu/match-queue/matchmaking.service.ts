import { Injectable, Injector, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchFoundDialogComponent } from './match-found.component';
import { WsService } from '../../ws/ws.service';
import { InCmd } from '../../ws/ws-messages';
import { NotificationService } from './notification.service';
import { ActiveLobbyTypes } from '../../lobby/cadegoose/lobby-type';
import { SubscribeData } from '../../ws/ws-subscribe-types';

@Injectable()
export class MatchmakingService {
  private ws = inject(WsService);
  private dialog = inject(MatDialog);
  private injector = inject(Injector);
  private ns = inject(NotificationService);

  inQueue = false;

  constructor() {
    this.ws.connected$.subscribe(() => {
      this.inQueue = false;
    });

    this.ws.subscribe(InCmd.QueueMatch, message => {
      this.openMatchFoundDialog(message);
    });
  }

  private openMatchFoundDialog(m: SubscribeData[InCmd.QueueMatch]): void {
    this.inQueue = false;
    const dialogRef = this.dialog.open(MatchFoundDialogComponent, {
      width: '300px',
      disableClose: true,
      data: m,
      injector: this.injector,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.inQueue = false;
    });

    if (document.visibilityState === 'visible') return;
    const lobbyName = ActiveLobbyTypes.find(l => l.id === m.area)?.name;
    this.ns.notify('Match found', { body: `You have a ${lobbyName} match ready!` });
  }
}
