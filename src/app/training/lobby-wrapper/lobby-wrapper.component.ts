import { Component, OnDestroy } from '@angular/core';
import { WsService } from '../../ws/ws.service';
import { LobbyWrapperService } from '../../replay/lobby-wrapper/lobby-wrapper.service';

@Component({
  selector: 'q-lobby-wrapper',
  templateUrl: './lobby-wrapper.component.html',
  styleUrls: ['./lobby-wrapper.component.scss'],
  providers: [WsService],
})
export class LobbyWrapperComponent implements OnDestroy {
  constructor(
    ws: WsService,
    private wrapper: LobbyWrapperService,
  ) {
    wrapper.ws = ws;
  }

  ngOnDestroy() {
    delete this.wrapper.ws;
  }
}
