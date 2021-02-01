import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { WsService } from './ws.service';
import { StatService } from './chat/stat/stat.service';
import { WindowService } from './window.service';

@Component({
  selector: 'q-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    public ws: WsService,
    public router: Router,
    public stat: StatService,
    public wd: WindowService,
  ) { }

  focus() {
    if (document.activeElement?.id === 'textinput') return;
    document.getElementById('textinput')?.focus();
  }
}
