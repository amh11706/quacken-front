import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { WsService } from '../../ws.service';

@Component({
  selector: 'q-logout-confirm',
  templateUrl: './logout-confirm.component.html',
  styleUrls: ['./logout-confirm.component.css'],
})
export class LogoutConfirmComponent implements OnInit, OnDestroy {
  seconds = 10;
  private ticker?: number;

  constructor(
    private ws: WsService,
    private router: Router,
    public dialogRef: MatDialogRef<LogoutConfirmComponent>,
  ) { }

  ngOnInit(): void {
    this.ticker = window.setInterval(() => {
      if (this.seconds === 0) void this.logout();
      else this.seconds--;
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.ticker);
  }

  async logout(): Promise<void> {
    this.ws.close();
    window.localStorage.removeItem('token');
    await this.router.navigate(['auth/login']);
    this.dialogRef.close();
  }
}
