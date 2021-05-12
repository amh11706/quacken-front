import { Component } from '@angular/core';
import { WsService } from '../ws.service';
import { EscMenuService } from './esc-menu.service';
import { ProfileComponent } from './profile/profile.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SettingsComponent } from '../settings/settings.component';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'q-esc-menu',
  templateUrl: './esc-menu.component.html',
  styleUrls: ['./esc-menu.component.scss']
})
export class EscMenuComponent {
  ProfileComponent = ProfileComponent;
  InventoryComponent = InventoryComponent;
  SettingsComponent = SettingsComponent;

  constructor(
    public es: EscMenuService,
    public ss: SettingsService,
    public ws: WsService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.es.activeTab = 0;
  }

  logout() {
    this.dialog.open(LogoutConfirmComponent, { width: '90%', maxWidth: '300px' });
  }

  leave() {
    this.router.navigateByUrl('/list');
    this.es.open = false;
  }

  openDiscord() {
    window.open('https://discord.gg/SDFPXp2Cmq', '_blank');
  }
}
