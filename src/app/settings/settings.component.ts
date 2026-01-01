import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SettingsService } from './settings.service';
import { WsService } from '../ws/ws.service';
import { KeyBindingService } from './key-binding/key-binding.service';
import { Sounds, SoundService } from '../sound.service';

@Component({
  selector: 'q-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SettingsComponent {
  ss = inject(SettingsService);
  ws = inject(WsService);
  kbs = inject(KeyBindingService);
  sound = inject(SoundService);

  links = [
    { title: 'Lobby Settings', icon: 'settings', path: 'lobby' },
    { title: 'Global Settings', icon: 'languages', path: 'global' },
  ];

  Sounds = Sounds;
}
