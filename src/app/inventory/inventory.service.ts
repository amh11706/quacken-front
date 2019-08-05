import { Injectable } from '@angular/core';

import { WsService } from '../ws.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  open = false;

  constructor(private ws: WsService) {
    this.ws.connected$.subscribe(value => {
      if (!value) {
        this.open = false;
      }
    });
  }
}
