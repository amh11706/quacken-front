import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SettingsService } from './settings.service';
import { WsService } from '../ws/ws.service';
import { KeyBindingService } from './key-binding/key-binding.service';
import { Sounds, SoundService } from '../sound.service';

@Component({
  selector: 'q-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  links = [
    { title: 'Lobby Settings', icon: 'settings', path: 'lobby' },
    { title: 'Global Settings', icon: 'languages', path: 'global' },
  ];

  Sounds = Sounds;

  constructor(
    public ss: SettingsService,
    public ws: WsService,
    public kbs: KeyBindingService,
    public sound: SoundService,
  ) { }
}
