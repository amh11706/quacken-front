import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { MatDialogRef } from '@angular/material/dialog';
import { WsService } from '../../ws/ws.service';
import { Competitions } from './competition';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { DBSetting, ServerSettingMap } from '../../settings/types';

@Component({
  selector: 'q-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CompetitionComponent implements OnInit, OnDestroy {
  created = false;
  competitions = Competitions;
  selectedRound = Competitions[0]?.rounds[0];
  private sub = new Subscription();

  constructor(
    public ws: WsService,
    private ref: MatDialogRef<CompetitionComponent>,
  ) { }

  ngOnInit(): void {
    this.sub.add(this.ws.subscribe(InCmd.NavigateTo, () => this.ref.close()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  createLobby(c: Record<string, Partial<DBSetting>>): void {
    this.created = true;
    this.ws.send(OutCmd.LobbyCreate, c as ServerSettingMap);
  }
}
