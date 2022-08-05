import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeyActions } from '../settings/key-binding/key-actions';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { WsService } from '../ws.service';

@Injectable({
  providedIn: 'root',
})
export class EscMenuService {
  open = false;
  lobbyComponent: any;
  activeTab = 1;
  lobbyTab = 0;
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
      if (v) this.openTab(3);
    });
    kbs.subscribe(KeyActions.OpenInventory, v => {
      if (v) this.openTab(2);
    });
    kbs.subscribe(KeyActions.OpenProfile, v => {
      if (v) this.openTab(1);
    });
    kbs.subscribe(KeyActions.LeaveLobby, v => {
      if (v && (this.lobbyComponent || this.lobbyContext)) this.leave();
    });
    kbs.subscribe(KeyActions.Logout, v => {
      if (v) this.logout();
    });
  }

  private openTab(tab: number) {
    if (this.open && this.activeTab === tab) {
      this.open = false;
      return;
    }
    this.open = true;
    this.activeTab = tab;
  }

  setLobby(component?: unknown, context?: unknown): void {
    this.activeTab = -1;
    this.lobbyComponent = component;
    this.lobbyContext = context;
    if (!this.lobbyComponent) this.open = false;
  }

  private logout() {
    this.ws.close();
    window.localStorage.removeItem('token');
    void this.router.navigate(['auth/login']);
  }

  leave(): void {
    void this.router.navigateByUrl('/list');
    this.open = false;
  }
}
