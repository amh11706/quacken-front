import { Injectable } from '@angular/core';
import { WsService } from '../ws.service';
import { ProfileComponent } from './profile/profile.component';

@Injectable({
  providedIn: 'root'
})
export class EscMenuService {
  open = false;
  activeComponent: any = ProfileComponent;
  lobbyComponent: any;
  lobbyContext: any;

  constructor(private ws: WsService) {
    this.ws.connected$.subscribe(v => {
      if (!v) this.open = false;
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (this.ws.connected) this.open = !this.open;
    });
  }

  setLobby(component?: any, context?: any) {
    if (this.activeComponent === this.lobbyComponent) this.activeComponent = ProfileComponent;
    else if (component) {
      this.activeComponent = component;
    }
    this.lobbyComponent = component;
    this.lobbyContext = context;
  }
}
