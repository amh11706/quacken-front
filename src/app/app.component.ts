import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { WsService } from './ws.service';
import { StatService } from './chat/stat/stat.service';
import { LogoutConfirmComponent } from './login/logout-confirm/logout-confirm.component';
import { WindowService } from './window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    public ws: WsService,
    public router: Router,
    public stat: StatService,
    private dialog: MatDialog,
    public wd: WindowService,
  ) { }

  logout() {
    this.dialog.open(LogoutConfirmComponent);
  }

  focus() {
    if (document.activeElement.id === 'textinput') return;
    const el = document.getElementById('textinput');
    if (el) el.focus();
  }
}
