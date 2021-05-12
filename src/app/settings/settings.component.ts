import { Component } from '@angular/core';

import { SettingsService } from './settings.service';
import { WsService } from '../ws.service';
import { KeyBindingService } from './key-binding/key-binding.service';

@Component({
  selector: 'q-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  links = [
    { title: 'Lobby Settings', icon: 'settings', path: 'lobby' },
    { title: 'Global Settings', icon: 'languages', path: 'global' },
  ];

  constructor(
    public ss: SettingsService,
    public ws: WsService,
    public kbs: KeyBindingService,
  ) { }

}
