import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LogoutConfirmComponent } from './logout-confirm/logout-confirm.component';
import { WsService } from '../ws.service';
import { EscMenuService } from './esc-menu.service';
import { AccountComponent } from './account/account.component';
import { ProfileComponent } from './profile/profile.component';
import { InventoryComponent } from './inventory/inventory.component';
import { Router } from '@angular/router';

@Component({
  selector: 'q-esc-menu',
  templateUrl: './esc-menu.component.html',
  styleUrls: ['./esc-menu.component.scss']
})
export class EscMenuComponent implements OnInit {
  AccountComponent = AccountComponent;
  ProfileComponent = ProfileComponent;
  InventoryComponent = InventoryComponent;

  constructor(
    public es: EscMenuService,
    public ws: WsService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.ws.connected$.subscribe(v => {
      if (!v) this.es.open = false;
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (this.ws.connected) this.es.open = !this.es.open;
    });
  }

  logout() {
    this.dialog.open(LogoutConfirmComponent, { width: '90%', maxWidth: '300px' });
  }

  leave() {
    this.router.navigateByUrl('/list');
    this.es.open = false;
  }

}
