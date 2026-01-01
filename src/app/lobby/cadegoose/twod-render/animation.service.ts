import { Injectable, NgZone, OnDestroy, signal, inject } from '@angular/core';
import * as TWEEN from '@tweenjs/tween.js';
import { SettingsService } from '../../../settings/settings.service';

export const enum PlayState {
  Playing = 'playing',
  Paused = 'paused',
}

@Injectable({
  providedIn: 'any',
})
export class AnimationService implements OnDestroy {
  private ss = inject(SettingsService);

  readonly tweens = new TWEEN.Group();
  private readonly _playState = signal<PlayState>(PlayState.Playing);
  readonly playState = this._playState.asReadonly();
  private readonly _newFrame = signal(0);
  readonly newFrame = this._newFrame.asReadonly();
  private readonly _animationsUpdated = signal(0);
  readonly updated = this._animationsUpdated.asReadonly();

  tweenProgress = 0;
  private alive = true;
  private frameRequested = false;
  private lastFrame: number | null = null;
  private frameTarget = 0;
  private readonly maxFps = this.ss.prefetch('graphics').maxFps;
  readonly speed = this.ss.prefetch('graphics').speed;

  constructor() {
    const ngZone = inject(NgZone);

    ngZone.runOutsideAngular(this.requestRender.bind(this));
    this.ss.getGroup('graphics');
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  play(): void {
    this._playState.set(PlayState.Playing);
  }

  pause(): void {
    this._playState.set(PlayState.Paused);
  }

  togglePlay(): void {
    this._playState.set(this.playState() === PlayState.Playing ? PlayState.Paused : PlayState.Playing);
  }

  private animate = () => {
    const t = new Date().valueOf();
    if (!this.lastFrame) this.lastFrame = t;
    if (t < this.frameTarget) {
      this.frameRequested = false;
      this.requestRender();
      return;
    }
    this._newFrame.set(t);
    this.frameTarget = Math.max(t, this.frameTarget + 1000 / this.maxFps.value);

    if (this.playState() === PlayState.Playing) {
      this.tweenProgress += (t - this.lastFrame);
      if (this.tweens.update(this.tweenProgress)) {
        this._animationsUpdated.set(t);
      }
    }

    this.frameRequested = false;
    this.lastFrame = t;
    this.requestRender();
  };

  private requestRender = () => {
    if (!this.alive || this.frameRequested) return;
    this.frameRequested = true;
    window.requestAnimationFrame(this.animate);
  };
}
