import { Component, OnInit } from '@angular/core';
import { WsService } from '../ws.service';
import { EscMenuService } from './esc-menu.service';
import { ProfileComponent } from './profile/profile.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SettingsComponent } from '../settings/settings.component';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'q-esc-menu',
  templateUrl: './esc-menu.component.html',
  styleUrls: ['./esc-menu.component.scss']
})
export class EscMenuComponent implements OnInit {
  ProfileComponent = ProfileComponent;
  InventoryComponent = InventoryComponent;
  SettingsComponent = SettingsComponent;

  constructor(
    public es: EscMenuService,
    public ws: WsService,
    private dialog: MatDialog,
  ) {
    this.es.defaultComponent = ProfileComponent;
    this.es.activeComponent = ProfileComponent;
  }

  ngOnInit(): void {
  }

  logout() {
    this.dialog.open(LogoutConfirmComponent, { width: '90%', maxWidth: '300px' });
  }

}
