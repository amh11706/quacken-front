import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { MatDialogRef } from '@angular/material/dialog';
import { WsService } from '../../ws/ws.service';
import { Competitions } from './competition';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { DBSetting, ServerSettingMap } from '../../settings/types';

@Component({
  selector: 'q-competition',
  templateUrl: './competition.component.html',
  styleUrl: './competition.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CompetitionComponent implements OnInit, OnDestroy {
  ws = inject(WsService);
  private ref = inject<MatDialogRef<CompetitionComponent>>(MatDialogRef);

  created = false;
  competitions = Competitions;
  selectedRound?: typeof Competitions[0]['rounds'][0] = Competitions[0]?.rounds[0];
  private sub = new Subscription();

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
