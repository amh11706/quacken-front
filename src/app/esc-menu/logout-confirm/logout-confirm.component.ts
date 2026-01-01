import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { WsService } from '../../ws/ws.service';

@Component({
  selector: 'q-logout-confirm',
  templateUrl: './logout-confirm.component.html',
  styleUrl: './logout-confirm.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LogoutConfirmComponent implements OnInit, OnDestroy {
  private ws = inject(WsService);
  private router = inject(Router);
  dialogRef = inject<MatDialogRef<LogoutConfirmComponent>>(MatDialogRef);

  seconds$ = new BehaviorSubject<number>(10);
  private ticker?: number;

  ngOnInit(): void {
    this.ticker = window.setInterval(() => {
      const seconds = this.seconds$.getValue();
      if (seconds === 0) void this.logout();
      else this.seconds$.next(seconds - 1);
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
