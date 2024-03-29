import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'q-logout-confirm',
  templateUrl: './logout-confirm.component.html',
  styleUrls: ['./logout-confirm.component.css']
})
export class LogoutConfirmComponent implements OnInit, OnDestroy {
  seconds = 10;
  private ticker?: number;

  constructor(
    private ws: WsService,
    private router: Router,
    public dialogRef: MatDialogRef<LogoutConfirmComponent>,
  ) { }

  ngOnInit() {
    this.ticker = window.setInterval(() => {
      if (this.seconds === 0) this.logout();
      else this.seconds--;
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.ticker);
  }

  logout() {
    this.ws.close();
    localStorage.removeItem('token');
    this.router.navigate(['auth/login']);
    this.dialogRef.close();
  }

}
