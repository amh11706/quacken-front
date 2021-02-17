import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeyActions } from '../settings/key-binding/key-actions';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { SettingsComponent } from '../settings/settings.component';
import { WsService } from '../ws.service';
import { InventoryComponent } from './inventory/inventory.component';
import { ProfileComponent } from './profile/profile.component';

@Injectable({
  providedIn: 'root'
})
export class EscMenuService {
  open = false;
  activeComponent: any = ProfileComponent;
  lobbyComponent: any;
  lobbyContext: any;

  constructor(
    private ws: WsService,
    private router: Router,
    kbs: KeyBindingService,
  ) {
    this.ws.connected$.subscribe(v => {
      if (!v) this.open = false;
    });

    kbs.subscribe(KeyActions.ToggleEscMenu, v => {
      if (v) this.open = !this.open;
    });
    kbs.subscribe(KeyActions.OpenLobby, v => {
      if (v) this.openTab(this.lobbyComponent);
    });
    kbs.subscribe(KeyActions.OpenSettings, v => {
      if (v) this.openTab(SettingsComponent);
    });
    kbs.subscribe(KeyActions.OpenInventory, v => {
      if (v) this.openTab(InventoryComponent);
    });
    kbs.subscribe(KeyActions.OpenProfile, v => {
      if (v) this.openTab(ProfileComponent);
    });
    kbs.subscribe(KeyActions.LeaveLobby, v => {
      if (v && (this.lobbyComponent || this.lobbyContext)) this.leave();
    });
    kbs.subscribe(KeyActions.Logout, v => {
      if (v) this.logout();
    });
  }

  private openTab(component: any) {
    if (!component) return;
    if (this.open && this.activeComponent === component) {
      this.open = false;
      return;
    }
    this.open = true;
    this.activeComponent = component;
  }

  setLobby(component?: any, context?: any) {
    if (this.activeComponent === this.lobbyComponent) this.activeComponent = ProfileComponent;
    else if (component) {
      this.activeComponent = component;
    }
    this.lobbyComponent = component;
    this.lobbyContext = context;
  }

  private logout() {
    this.ws.close();
    localStorage.removeItem('token');
    this.router.navigate(['auth/login']);
  }

  leave() {
    this.router.navigateByUrl('/list');
    this.open = false;
  }

}
