import { ChangeDetectionStrategy, Component, Injector, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WsService } from '../ws/ws.service';
import { EscMenuService } from './esc-menu.service';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { SettingsService } from '../settings/settings.service';
import { FriendsService } from '../chat/friends/friends.service';

@Component({
  selector: 'q-esc-menu',
  templateUrl: './esc-menu.component.html',
  styleUrl: './esc-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EscMenuComponent {
  es = inject(EscMenuService);
  ss = inject(SettingsService);
  fs = inject(FriendsService);
  ws = inject(WsService);
  private dialog = inject(MatDialog);
  private injector = inject(Injector);

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
