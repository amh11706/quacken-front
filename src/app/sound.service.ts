import { Injectable } from '@angular/core';
import { SettingMap, SettingsService } from './settings/settings.service';

export enum Sounds {
  BattleStart,
  CannonFireBig,
  CannonFireMedium,
  CannonFireSmall,
  CannonHit,
  CannonSplash,
  CannonSplash2,
  RockDamage,
  Sink,
  // Notification,
}

const enum SoundGroups {
  Notification = 'notification',
  Alert = 'alert',
  ship = 'ship',
}

interface SoundFile {
  file: string,
  group: SoundGroups,
  minDelay: number,
  lastPlayed?: number,
  volume?: number,
}

const SoundFiles: Record<Sounds, SoundFile> = {
  [Sounds.BattleStart]: { file: 'battle_starting.ogg', group: SoundGroups.Alert, minDelay: 1500 },
  [Sounds.CannonFireBig]: { file: 'cannon_fire_big.ogg', group: SoundGroups.ship, minDelay: 50, volume: 0.4 },
  [Sounds.CannonFireMedium]: { file: 'cannon_fire_medium.ogg', group: SoundGroups.ship, minDelay: 50, volume: 0.4 },
  [Sounds.CannonFireSmall]: { file: 'cannon_fire_small.ogg', group: SoundGroups.ship, minDelay: 5, volume: 0.4 },
  [Sounds.CannonHit]: { file: 'cannonball_hit.ogg', group: SoundGroups.ship, minDelay: 50 },
  [Sounds.CannonSplash]: { file: 'cannonball_splash.ogg', group: SoundGroups.ship, minDelay: 100, volume: 0.7 },
  [Sounds.CannonSplash2]: { file: 'cannonball_splash2.ogg', group: SoundGroups.ship, minDelay: 100, volume: 0.7 },
  [Sounds.RockDamage]: { file: 'rock_damage.ogg', group: SoundGroups.ship, minDelay: 100 },
  [Sounds.Sink]: { file: 'ship_sunk.ogg', group: SoundGroups.ship, minDelay: 500 },
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private loaded = new Map<Sounds, Promise<string>>();
  private settings: SettingMap = {};

  constructor(ss: SettingsService) {
    ss.getGroup('sounds').then(settings => this.settings = settings);
  }

  load(sound: Sounds) {
    let p = this.loaded.get(sound);
    if (p) return p;
    p = fetch('assets/sounds/' + SoundFiles[sound].file)
      .then(file => file.blob())
      .then(URL.createObjectURL);
    this.loaded.set(sound, p);
    return p;
  }

  async play(sound: Sounds, fallback?: Sounds): Promise<void> {
    const masterVolume = this.settings.master?.value;
    if (!masterVolume) return;
    const file = SoundFiles[sound];
    const now = new Date().valueOf();
    if (file.lastPlayed && file.lastPlayed + file.minDelay > now) return;
    file.lastPlayed = now;

    const groupVolume = (this.settings[file.group]?.value ?? 50);
    if (!groupVolume && fallback) return this.play(fallback);

    const audio = new Audio();
    audio.src = await this.load(sound)
    audio.volume = (file.volume || 1) * groupVolume * masterVolume / 10000;
    audio.play();
  }
}
