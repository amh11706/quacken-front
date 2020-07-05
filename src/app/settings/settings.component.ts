import { Component, OnInit } from '@angular/core';

import { SettingsService } from './settings.service';
import { WsService } from '../ws.service';

@Component({
  selector: 'q-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  links = [
    { title: 'Lobby Settings', icon: 'settings', path: 'lobby' },
    { title: 'Global Settings', icon: 'languages', path: 'global' },
  ];

  constructor(
    public ss: SettingsService,
    public ws: WsService,
  ) { }

  ngOnInit() {
  }

}
