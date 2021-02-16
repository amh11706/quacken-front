import { Injectable } from '@angular/core';
import { KeyActions } from '../settings/key-binding/key-actions';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
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

  constructor(private ws: WsService, kbs: KeyBindingService) {
    this.ws.connected$.subscribe(v => {
      if (!v) this.open = false;
    });

    kbs.subscribe(KeyActions.ToggleEscMenu, v => {
      if (this.ws.connected && v) this.open = !this.open;
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
