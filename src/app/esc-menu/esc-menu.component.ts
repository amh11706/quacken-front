import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WsService } from '../ws/ws.service';
import { EscMenuService } from './esc-menu.service';
import { ProfileComponent } from './profile/profile.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SettingsComponent } from '../settings/settings.component';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { SettingsService } from '../settings/settings.service';
import { FriendsService } from '../chat/friends/friends.service';

@Component({
  selector: 'q-esc-menu',
  templateUrl: './esc-menu.component.html',
  styleUrls: ['./esc-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EscMenuComponent {
  ProfileComponent = ProfileComponent;
  InventoryComponent = InventoryComponent;
  SettingsComponent = SettingsComponent;

  constructor(
    public es: EscMenuService,
    public ss: SettingsService,
    public fs: FriendsService,
    public ws: WsService,
    private dialog: MatDialog,
  ) { }

  logout(): void {
    this.dialog.open(LogoutConfirmComponent, { width: '90%', maxWidth: '300px' });
  }
}
