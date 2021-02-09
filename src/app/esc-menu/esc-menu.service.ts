import { Injectable } from '@angular/core';
import { ProfileComponent } from './profile/profile.component';

@Injectable({
  providedIn: 'root'
})
export class EscMenuService {
  open = false;
  activeComponent: any = ProfileComponent;
  lobbyComponent: any;
  lobbyContext: any;

  constructor() { }

  setLobby(component?: any, context?: any) {
    if (this.activeComponent === this.lobbyComponent) this.activeComponent = ProfileComponent;
    else if (component) {
      this.activeComponent = component;
    }
    this.lobbyComponent = component;
    this.lobbyContext = context;
  }
}
