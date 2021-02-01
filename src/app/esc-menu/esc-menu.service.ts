import { Injectable } from '@angular/core';
import { ProfileComponent } from './profile/profile.component';

@Injectable({
  providedIn: 'root'
})
export class EscMenuService {
  open = true;
  activeComponent: any = ProfileComponent;
  lobbyComponent: any;
  lobbyContext: any;

  constructor() { }

  setLobby(component?: any, context?: any) {
    this.lobbyComponent = component;
    this.lobbyContext = context;
    if (component) this.activeComponent = component;
    else if (!this.activeComponent) this.activeComponent = ProfileComponent;
  }
}
