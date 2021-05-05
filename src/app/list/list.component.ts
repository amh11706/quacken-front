import { Component } from '@angular/core';
import { WsService } from '../ws.service';


@Component({
  selector: 'q-lobby-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {

  constructor(ws: WsService) {
    const token = localStorage.getItem('token');
    if (!ws.connected && token) ws.connect(token);
    if (token === 'guest') window.addEventListener('beforeunload', () => localStorage.removeItem('token'));
  }
}
