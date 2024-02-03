import { Injectable } from '@angular/core';
import { SettingsService } from './settings/settings.service';

/* eslint no-unused-vars: "off" */
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
  Notification,
}

const enum SoundGroups {
  Notification = 'notification',
  Alert = 'alert',
  Ship = 'ship',
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
  [Sounds.CannonFireBig]: { file: 'cannon_fire_big.ogg', group: SoundGroups.Ship, minDelay: 50 },
  [Sounds.CannonFireMedium]: { file: 'cannon_fire_medium.ogg', group: SoundGroups.Ship, minDelay: 50, volume: 0.7 },
  [Sounds.CannonFireSmall]: { file: 'cannon_fire_small.ogg', group: SoundGroups.Ship, minDelay: 50, volume: 0.4 },
  [Sounds.CannonHit]: { file: 'cannonball_hit.ogg', group: SoundGroups.Ship, minDelay: 50 },
  [Sounds.CannonSplash]: { file: 'cannonball_splash.ogg', group: SoundGroups.Ship, minDelay: 100, volume: 0.7 },
  [Sounds.CannonSplash2]: { file: 'cannonball_splash2.ogg', group: SoundGroups.Ship, minDelay: 100, volume: 0.7 },
  [Sounds.RockDamage]: { file: 'rock_damage.ogg', group: SoundGroups.Ship, minDelay: 100 },
  [Sounds.Sink]: { file: 'ship_sunk.ogg', group: SoundGroups.Ship, minDelay: 500 },
  [Sounds.Notification]: { file: 'notification.mp3', group: SoundGroups.Notification, minDelay: 1500, volume: 5 },
};

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private loaded = new Map<Sounds, Promise<AudioBuffer>>();
  private settings = this.ss.prefetch('sounds');
  private ctx = new AudioContext();

  constructor(private ss: SettingsService) {
    void ss.getGroup('sounds').then(settings => this.settings = settings);
  }

  load(sound: Sounds): Promise<AudioBuffer> {
    let p = this.loaded.get(sound);
    if (p) return p;
    p = window.fetch('assets/sounds/' + SoundFiles[sound].file)
      .then(file => file.arrayBuffer())
      .then(file => this.ctx.decodeAudioData(file));
    this.loaded.set(sound, p);
    return p;
  }

  async play(sound: Sounds, delay = 0, fallback?: Sounds): Promise<void> {
    const masterVolume = this.settings.master?.value;
    if (!masterVolume) return;
    const file = SoundFiles[sound];
    if (!file) throw new Error('Sound not found: ' + sound);
    if (delay) {
      setTimeout(() => this.play(sound, 0, fallback));
      return;
    }
    const now = new Date().valueOf();
    if (file.lastPlayed && file.lastPlayed + file.minDelay > now) return;
    file.lastPlayed = now;

    const groupVolume = (this.settings[file.group]?.value ?? 50);
    if (!groupVolume && fallback) return this.play(fallback, delay);

    const source = this.ctx.createBufferSource();
    source.buffer = await this.load(sound);
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = (file.volume || 1) * groupVolume * masterVolume / 10000;
    gainNode.connect(this.ctx.destination);
    source.connect(gainNode);
    source.onended = () => gainNode.disconnect();
    return source.start(0);
  }
}
