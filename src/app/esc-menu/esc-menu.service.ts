import { Injectable } from '@angular/core';
import { AccountComponent } from './account/account.component';
import { ProfileComponent } from './profile/profile.component';

@Injectable({
  providedIn: 'root'
})
export class EscMenuService {
  open = false;
  activeComponent: any = AccountComponent;
  lobbyComponent: any;
  lobbyContext: any;

  constructor() { }

  setLobby(component?: any, context?: any) {
    if (this.activeComponent === this.lobbyComponent) this.activeComponent = ProfileComponent;
    else if (component) {
      this.activeComponent = component;
      this.open = true;
    }
    this.lobbyComponent = component;
    this.lobbyContext = context;
  }
}
