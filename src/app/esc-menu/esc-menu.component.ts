import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WsService } from '../ws/ws.service';
import { EscMenuService } from './esc-menu.service';
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
  constructor(
    public es: EscMenuService,
    public ss: SettingsService,
    public fs: FriendsService,
    public ws: WsService,
    private dialog: MatDialog,
    private injector: Injector,
  ) { }

  onTabChange(index: number) {
    void this.es.tabChange(index);
  }

  onLobbyTabChange(index: number) {
    void this.es.tabChange(0, false, { lobbyTab: index });
  }

  logout(): void {
    this.dialog.open(LogoutConfirmComponent, { width: '90%', maxWidth: '300px', injector: this.injector });
  }
}
