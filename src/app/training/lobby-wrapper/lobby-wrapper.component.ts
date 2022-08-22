import { Component } from '@angular/core';
import { WsService } from '../../ws.service';

@Component({
  selector: 'q-lobby-wrapper',
  templateUrl: './lobby-wrapper.component.html',
  styleUrls: ['./lobby-wrapper.component.scss'],
  providers: [WsService],
})
export class LobbyWrapperComponent {
  constructor(public ws: WsService) { }
}
